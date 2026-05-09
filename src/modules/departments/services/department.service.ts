import { AppError } from '../../../shared/core/errors/app-error';
import {
    PaginatedResponse,
    paginateItems,
    sortItems,
} from '../../../shared/core/pagination';
import {
    DepartmentDoctorEntity,
    DepartmentEntity,
    DepartmentNurseEntity,
    DepartmentRoomEntity,
} from '../domain/department.entity';
import { DepartmentRepository } from '../domain/department.repository';
import {
    CreateDepartmentDto,
    GetAllDepartmentsQueryDto,
    GetDepartmentsQueryDto,
    UpdateDepartmentDto,
} from '../dto/department.dto';

const departmentSortAccessors = {
    created_at: (department: DepartmentEntity) => department.createdAt,
    name: (department: DepartmentEntity) => department.name,
    location: (department: DepartmentEntity) => department.location,
} as const;

export class DepartmentService {
    constructor(private readonly departmentRepository: DepartmentRepository) { }

    async createDepartment(data: CreateDepartmentDto): Promise<DepartmentEntity> {
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

    async getDepartments(
        data: GetDepartmentsQueryDto,
    ): Promise<PaginatedResponse<DepartmentEntity>> {
        const departments = await this.departmentRepository.findMany();
        const sortedDepartments = sortItems(
            departments,
            data.sortBy,
            data.order,
            departmentSortAccessors,
        );

        return paginateItems(sortedDepartments, data.page, data.limit);
    }

    async getAllDepartments(
        data: GetAllDepartmentsQueryDto,
    ): Promise<{ data: DepartmentEntity[] }> {
        const departments = await this.departmentRepository.findMany();
        const sortedDepartments = sortItems(
            departments,
            data.sortBy,
            data.order,
            departmentSortAccessors,
        );

        return { data: sortedDepartments };
    }

    async getDepartmentById(id: string): Promise<DepartmentEntity> {
        return this.ensureDepartmentExists(id);
    }

    async updateDepartment(
        id: string,
        data: UpdateDepartmentDto,
    ): Promise<DepartmentEntity> {
        await this.ensureDepartmentExists(id);

        if (data.name !== undefined) {
            const normalizedName = data.name.trim();
            const existingDepartment =
                await this.departmentRepository.findByName(normalizedName);

            if (existingDepartment && existingDepartment.id !== id) {
                throw new AppError('Department already exists', 409);
            }
        }

        return this.departmentRepository.update(id, {
            ...(data.name !== undefined
                ? { name: data.name.trim() }
                : {}),
            ...(data.description !== undefined
                ? { description: this.normalizeDescription(data.description) }
                : {}),
            ...(data.location !== undefined
                ? { location: data.location.trim() }
                : {}),
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

    async getDepartmentNurses(id: string): Promise<DepartmentNurseEntity[]> {
        await this.ensureDepartmentExists(id);

        return this.departmentRepository.findNursesByDepartmentId(id);
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
