import { AppError } from '../../../shared/core/errors/app-error';
import {
    PaginatedResponse,
    paginateItems,
    sortItems,
} from '../../../shared/core/pagination';
import { AuthUserResponse } from '../../auth/services/auth.service';
import { DoctorEntity } from '../domain/doctor.entity';
import { DoctorRepository, UpdateDoctorData } from '../domain/doctor.repository';
import {
    CreateDoctorDto,
    GetDoctorsQueryDto,
    UpdateDoctorDto,
} from '../dto/doctor.dto';

export interface DoctorUserProvisioningService {
    provisionDoctorUser(input: {
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        password?: string;
    }): Promise<AuthUserResponse>;
    ensureUserHasRole(userId: string, roleName: string): Promise<void>;
    removeRoleFromUserByName(userId: string, roleName: string): Promise<void>;
    deleteUser(userId: string): Promise<void>;
}

const doctorSortAccessors = {
    created_at: (doctor: DoctorEntity) => doctor.createdAt,
    first_name: (doctor: DoctorEntity) => doctor.firstName,
    last_name: (doctor: DoctorEntity) => doctor.lastName,
    specialization: (doctor: DoctorEntity) => doctor.specialization,
} as const;

export class DoctorService {
    constructor(
        private readonly doctorRepository: DoctorRepository,
        private readonly userProvisioningService: DoctorUserProvisioningService,
    ) { }

    async createDoctor(data: CreateDoctorDto): Promise<DoctorEntity> {
        const providedUserId = data.userId?.trim();
        const departmentId = data.departmentId.trim();
        const firstName = data.firstName.trim();
        const lastName = data.lastName.trim();
        const specialization = data.specialization.trim();
        const phoneNumber = data.phoneNumber.trim();
        const password = data.password?.trim();

        await this.ensureDepartmentExists(departmentId);

        let userId = providedUserId;
        let shouldCleanupProvisionedUser = false;

        if (userId) {
            if (password) {
                throw new AppError(
                    'Password can only be provided when creating a new linked user',
                    400,
                );
            }

            await this.ensureUserExists(userId);

            const existingDoctor = await this.doctorRepository.findByUserId(userId);

            if (existingDoctor) {
                throw new AppError('Doctor already exists for this user', 409);
            }

            await this.userProvisioningService.ensureUserHasRole(userId, 'DOCTOR');
        } else {
            const provisionedUser = await this.userProvisioningService.provisionDoctorUser({
                firstName,
                lastName,
                phoneNumber,
                password,
            });

            userId = provisionedUser.id;
            shouldCleanupProvisionedUser = true;
        }

        try {
            return await this.doctorRepository.create({
                userId,
                firstName,
                lastName,
                specialization,
                departmentId,
                phoneNumber,
            });
        } catch (error) {
            if (shouldCleanupProvisionedUser && userId) {
                await this.userProvisioningService.deleteUser(userId).catch(() => undefined);
            }

            throw error;
        }
    }

    async getDoctors(
        data: GetDoctorsQueryDto,
    ): Promise<PaginatedResponse<DoctorEntity>> {
        const doctors = await this.doctorRepository.findMany();
        const normalizedSpecialization = data.specialization?.toLowerCase();

        const filteredDoctors = doctors.filter((doctor) => {
            if (data.departmentId && doctor.departmentId !== data.departmentId) {
                return false;
            }

            if (
                normalizedSpecialization
                && !doctor.specialization.toLowerCase().includes(
                    normalizedSpecialization,
                )
            ) {
                return false;
            }

            return true;
        });

        const sortedDoctors = sortItems(
            filteredDoctors,
            data.sortBy,
            data.order,
            doctorSortAccessors,
        );

        return paginateItems(sortedDoctors, data.page, data.limit);
    }

    async getDoctorById(id: string): Promise<DoctorEntity> {
        return this.ensureDoctorExists(id);
    }

    async setDoctorStatus(
        id: string,
        isActive: boolean,
    ): Promise<DoctorEntity> {
        await this.ensureDoctorExistsIncludingInactive(id);

        return this.doctorRepository.setStatus(id, isActive);
    }

    async updateDoctor(
        id: string,
        data: UpdateDoctorDto,
    ): Promise<DoctorEntity> {
        const existingDoctor = await this.ensureDoctorExists(id);
        let nextUserId = existingDoctor.userId;

        if (data.userId !== undefined) {
            const userId = data.userId.trim();

            await this.ensureUserExists(userId);

            const doctorWithSameUser = await this.doctorRepository.findByUserId(
                userId,
            );

            if (doctorWithSameUser && doctorWithSameUser.id !== id) {
                throw new AppError('Doctor already exists for this user', 409);
            }

            await this.userProvisioningService.ensureUserHasRole(userId, 'DOCTOR');
            nextUserId = userId;
        }

        if (data.departmentId !== undefined) {
            await this.ensureDepartmentExists(data.departmentId.trim());
        }

        const updateData: UpdateDoctorData = {
            ...(data.userId !== undefined
                ? { userId: data.userId.trim() }
                : {}),
            ...(data.firstName !== undefined
                ? { firstName: data.firstName.trim() }
                : {}),
            ...(data.lastName !== undefined
                ? { lastName: data.lastName.trim() }
                : {}),
            ...(data.specialization !== undefined
                ? { specialization: data.specialization.trim() }
                : {}),
            ...(data.departmentId !== undefined
                ? { departmentId: data.departmentId.trim() }
                : {}),
            ...(data.phoneNumber !== undefined
                ? { phoneNumber: data.phoneNumber.trim() }
                : {}),
        };

        const updatedDoctor = await this.doctorRepository.update(id, updateData);

        if (data.userId !== undefined && existingDoctor.userId !== nextUserId) {
            await this.removeDoctorRoleFromUser(existingDoctor.userId);
        }

        return updatedDoctor;
    }

    async deleteDoctor(id: string): Promise<void> {
        const doctor = await this.ensureDoctorExists(id);

        const usage = await this.doctorRepository.countUsage(id);

        if (usage.appointments > 0 || usage.medicalRecords > 0) {
            await this.doctorRepository.deactivate(id);
            await this.removeDoctorRoleFromUser(doctor.userId);

            return;
        }

        await this.doctorRepository.delete(id);
        await this.removeDoctorRoleFromUser(doctor.userId);
    }

    private async ensureDoctorExists(id: string): Promise<DoctorEntity> {
        const doctor = await this.doctorRepository.findById(id);

        if (!doctor) {
            throw new AppError('Doctor not found', 404);
        }

        return doctor;
    }

    private async ensureDoctorExistsIncludingInactive(
        id: string,
    ): Promise<DoctorEntity> {
        const doctor = await this.doctorRepository.findByIdIncludingInactive(id);

        if (!doctor) {
            throw new AppError('Doctor not found', 404);
        }

        return doctor;
    }

    private async ensureUserExists(userId: string): Promise<void> {
        const user = await this.doctorRepository.findUserById(userId.trim());

        if (!user) {
            throw new AppError('User not found', 404);
        }
    }

    private async ensureDepartmentExists(departmentId: string): Promise<void> {
        const department = await this.doctorRepository.findDepartmentById(
            departmentId.trim(),
        );

        if (!department) {
            throw new AppError('Department not found', 404);
        }
    }

    private async removeDoctorRoleFromUser(userId: string | null): Promise<void> {
        if (!userId) {
            return;
        }

        await this.userProvisioningService.removeRoleFromUserByName(userId, 'DOCTOR');
    }
}
