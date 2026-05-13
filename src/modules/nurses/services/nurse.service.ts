import { AppError } from '../../../shared/core/errors/app-error';
import {
    PaginatedResponse,
    paginateItems,
    sortItems,
} from '../../../shared/core/pagination';
import { AuthUserResponse } from '../../auth/services/auth.service';
import { NurseEntity } from '../domain/nurse.entity';
import { NurseRepository, UpdateNurseData } from '../domain/nurse.repository';
import {
    CreateNurseDto,
    GetNursesQueryDto,
    UpdateNurseDto,
} from '../dto/nurse.dto';

export interface NurseUserProvisioningService {
    provisionNurseUser(input: {
        firstName: string;
        lastName: string;
        email?: string;
        username?: string;
        password?: string;
    }): Promise<AuthUserResponse>;
    ensureUserHasRole(userId: string, roleName: string): Promise<void>;
    removeRoleFromUserByName(userId: string, roleName: string): Promise<void>;
    deleteUser(userId: string): Promise<void>;
}

const nurseSortAccessors = {
    created_at: (nurse: NurseEntity) => nurse.createdAt,
    first_name: (nurse: NurseEntity) => nurse.firstName,
    last_name: (nurse: NurseEntity) => nurse.lastName,
    shift: (nurse: NurseEntity) => nurse.shift,
} as const;

export class NurseService {
    constructor(
        private readonly nurseRepository: NurseRepository,
        private readonly userProvisioningService: NurseUserProvisioningService,
    ) { }

    async createNurse(data: CreateNurseDto): Promise<NurseEntity> {
        const providedUserId = data.userId?.trim();
        const departmentId = data.departmentId.trim();
        const firstName = data.firstName.trim();
        const lastName = data.lastName.trim();
        const email = data.email?.trim();
        const username = data.username?.trim();
        const password = data.password?.trim();

        await this.ensureDepartmentExists(departmentId);

        let userId = providedUserId;
        let shouldCleanupProvisionedUser = false;

        if (userId) {
            if (email || username || password) {
                throw new AppError(
                    'Email, username, and password can only be provided when creating a new linked user',
                    400,
                );
            }

            await this.ensureUserExists(userId);

            const existingNurse = await this.nurseRepository.findByUserId(userId);

            if (existingNurse) {
                throw new AppError('Nurse already exists for this user', 409);
            }

            await this.userProvisioningService.ensureUserHasRole(userId, 'NURSE');
        } else {
            const provisionedUser = await this.userProvisioningService.provisionNurseUser({
                firstName,
                lastName,
                email,
                username,
                password,
            });

            userId = provisionedUser.id;
            shouldCleanupProvisionedUser = true;
        }

        try {
            return await this.nurseRepository.create({
                userId,
                firstName,
                lastName,
                departmentId,
                shift: data.shift,
            });
        } catch (error) {
            if (shouldCleanupProvisionedUser && userId) {
                await this.userProvisioningService.deleteUser(userId).catch(() => undefined);
            }

            throw error;
        }
    }

    async getNurses(
        data: GetNursesQueryDto,
    ): Promise<PaginatedResponse<NurseEntity>> {
        const departmentId = data.departmentId?.trim();

        if (departmentId) {
            await this.ensureDepartmentExists(departmentId);
        }

        const nurses = await this.nurseRepository.findMany(departmentId);
        const sortedNurses = sortItems(
            nurses,
            data.sortBy,
            data.order,
            nurseSortAccessors,
        );

        return paginateItems(sortedNurses, data.page, data.limit);
    }

    async getNurseById(id: string): Promise<NurseEntity> {
        return this.ensureNurseExists(id);
    }

    async updateNurse(id: string, data: UpdateNurseDto): Promise<NurseEntity> {
        const existingNurse = await this.ensureNurseExists(id);
        let nextUserId = existingNurse.userId;

        if (data.departmentId !== undefined) {
            await this.ensureDepartmentExists(data.departmentId.trim());
        }

        if (data.userId !== undefined) {
            const userId = data.userId.trim();

            await this.ensureUserExists(userId);

            const nurseWithSameUser = await this.nurseRepository.findByUserId(userId);

            if (nurseWithSameUser && nurseWithSameUser.id !== id) {
                throw new AppError('Nurse already exists for this user', 409);
            }

            await this.userProvisioningService.ensureUserHasRole(userId, 'NURSE');
            nextUserId = userId;
        }

        const updateData: UpdateNurseData = {
            ...(data.userId !== undefined
                ? { userId: data.userId.trim() }
                : {}),
            ...(data.firstName !== undefined
                ? { firstName: data.firstName.trim() }
                : {}),
            ...(data.lastName !== undefined
                ? { lastName: data.lastName.trim() }
                : {}),
            ...(data.departmentId !== undefined
                ? { departmentId: data.departmentId.trim() }
                : {}),
            ...(data.shift !== undefined
                ? { shift: data.shift }
                : {}),
        };

        const updatedNurse = await this.nurseRepository.update(id, updateData);

        if (data.userId !== undefined && existingNurse.userId !== nextUserId) {
            await this.removeNurseRoleFromUser(existingNurse.userId);
        }

        return updatedNurse;
    }

    async deleteNurse(id: string): Promise<void> {
        const nurse = await this.ensureNurseExists(id);
        await this.nurseRepository.delete(id);
        await this.removeNurseRoleFromUser(nurse.userId);
    }

    private async ensureNurseExists(id: string): Promise<NurseEntity> {
        const nurse = await this.nurseRepository.findById(id);

        if (!nurse) {
            throw new AppError('Nurse not found', 404);
        }

        return nurse;
    }

    private async ensureDepartmentExists(departmentId: string): Promise<void> {
        const department = await this.nurseRepository.findDepartmentById(
            departmentId.trim(),
        );

        if (!department) {
            throw new AppError('Department not found', 404);
        }
    }

    private async ensureUserExists(userId: string): Promise<void> {
        const user = await this.nurseRepository.findUserById(userId.trim());

        if (!user) {
            throw new AppError('User not found', 404);
        }
    }

    private async removeNurseRoleFromUser(userId: string | null): Promise<void> {
        if (!userId) {
            return;
        }

        await this.userProvisioningService.removeRoleFromUserByName(userId, 'NURSE');
    }
}
