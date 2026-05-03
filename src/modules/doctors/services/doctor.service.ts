import { AppError } from '../../../shared/core/errors/app-error';
import { DoctorEntity } from '../domain/doctor.entity';
import { DoctorRepository, UpdateDoctorData } from '../domain/doctor.repository';
import { CreateDoctorDto, UpdateDoctorDto } from '../dto/doctor.dto';

export class DoctorService {
    constructor(private readonly doctorRepository: DoctorRepository) { }

    async createDoctor(data: CreateDoctorDto): Promise<DoctorEntity> {
        const userId = data.userId.trim();
        const departmentId = data.departmentId.trim();

        await this.ensureUserExists(userId);
        await this.ensureDepartmentExists(departmentId);

        const existingDoctor = await this.doctorRepository.findByUserId(
            userId,
        );

        if (existingDoctor) {
            throw new AppError('Doctor already exists for this user', 409);
        }

        return this.doctorRepository.create({
            userId,
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            specialization: data.specialization.trim(),
            departmentId,
            phoneNumber: data.phoneNumber.trim(),
        });
    }

    async getDoctors(): Promise<DoctorEntity[]> {
        return this.doctorRepository.findMany();
    }

    async getDoctorById(id: string): Promise<DoctorEntity> {
        return this.ensureDoctorExists(id);
    }

    async updateDoctor(
        id: string,
        data: UpdateDoctorDto,
    ): Promise<DoctorEntity> {
        await this.ensureDoctorExists(id);

        if (data.userId !== undefined) {
            const userId = data.userId.trim();

            await this.ensureUserExists(userId);

            const doctorWithSameUser = await this.doctorRepository.findByUserId(
                userId,
            );

            if (doctorWithSameUser && doctorWithSameUser.id !== id) {
                throw new AppError('Doctor already exists for this user', 409);
            }
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

        return this.doctorRepository.update(id, updateData);
    }

    async deleteDoctor(id: string): Promise<void> {
        await this.ensureDoctorExists(id);
        await this.doctorRepository.delete(id);
    }

    private async ensureDoctorExists(id: string): Promise<DoctorEntity> {
        const doctor = await this.doctorRepository.findById(id);

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
}
