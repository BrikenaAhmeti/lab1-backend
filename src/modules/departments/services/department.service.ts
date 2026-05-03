import { AppError } from '../../../shared/core/errors/app-error';
import {
    DepartmentDoctorEntity,
    DepartmentEntity,
    DepartmentRoomEntity,
} from '../domain/department.entity';
import { DepartmentRepository } from '../domain/department.repository';

export class DepartmentService {
    constructor(private readonly departmentRepository: DepartmentRepository) { }

    async createDepartment(data: {
        name: string;
        description?: string;
        location: string;
    }): Promise<DepartmentEntity> {
        const normalizedName = data.name.trim();
        const normalizedLocation = data.location.trim();

        const existingDepartment =
            await this.departmentRepository.findByName(normalizedName);

        if (existingDepartment) {
            throw new AppError('Department already exists', 409);
        }

        return this.departmentRepository.create({
            name: normalizedName,
            description: this.normalizeDescription(data.description),
            location: normalizedLocation,
        });
    }

    async getDepartments(): Promise<DepartmentEntity[]> {
        return this.departmentRepository.findMany();
    }

    async getDepartmentById(id: string): Promise<DepartmentEntity> {
        return this.ensureDepartmentExists(id);
    }

    async updateDepartment(
        id: string,
        data: {
            name: string;
            description?: string;
            location: string;
        },
    ): Promise<DepartmentEntity> {
        await this.ensureDepartmentExists(id);

        const normalizedName = data.name.trim();
        const normalizedLocation = data.location.trim();
        const existingDepartment =
            await this.departmentRepository.findByName(normalizedName);

        if (existingDepartment && existingDepartment.id !== id) {
            throw new AppError('Department already exists', 409);
        }

        return this.departmentRepository.update(id, {
            name: normalizedName,
            description: this.normalizeDescription(data.description),
            location: normalizedLocation,
        });
    }

    async deleteDepartment(id: string): Promise<void> {
        await this.ensureDepartmentExists(id);

        const usage = await this.departmentRepository.countUsage(id);

        if (usage.doctors > 0 || usage.rooms > 0 || usage.nurses > 0) {
            throw new AppError('Department cannot be deleted while it is in use', 409);
        }

        await this.departmentRepository.delete(id);
    }

    async getDepartmentDoctors(id: string): Promise<DepartmentDoctorEntity[]> {
        await this.ensureDepartmentExists(id);

        return this.departmentRepository.findDoctorsByDepartmentId(id);
    }

    async getDepartmentRooms(id: string): Promise<DepartmentRoomEntity[]> {
        await this.ensureDepartmentExists(id);

        return this.departmentRepository.findRoomsByDepartmentId(id);
    }

    private async ensureDepartmentExists(id: string): Promise<DepartmentEntity> {
        const department = await this.departmentRepository.findById(id);

        if (!department) {
            throw new AppError('Department not found', 404);
        }

        return department;
    }

    private normalizeDescription(description?: string): string | null {
        const value = description?.trim();

        if (!value) {
            return null;
        }

        return value;
    }
}
