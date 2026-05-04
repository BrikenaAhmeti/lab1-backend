import { AppError } from '../../../shared/core/errors/app-error';
import { NurseEntity } from '../domain/nurse.entity';
import { NurseRepository, UpdateNurseData } from '../domain/nurse.repository';
import { CreateNurseDto, UpdateNurseDto } from '../dto/nurse.dto';

export class NurseService {
    constructor(private readonly nurseRepository: NurseRepository) { }

    async createNurse(data: CreateNurseDto): Promise<NurseEntity> {
        const departmentId = data.departmentId.trim();

        await this.ensureDepartmentExists(departmentId);

        return this.nurseRepository.create({
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            departmentId,
            shift: data.shift,
        });
    }

    async getNurses(data: { departmentId?: string }): Promise<NurseEntity[]> {
        const departmentId = data.departmentId?.trim();

        if (departmentId) {
            await this.ensureDepartmentExists(departmentId);
        }

        return this.nurseRepository.findMany(departmentId);
    }

    async getNurseById(id: string): Promise<NurseEntity> {
        return this.ensureNurseExists(id);
    }

    async updateNurse(id: string, data: UpdateNurseDto): Promise<NurseEntity> {
        await this.ensureNurseExists(id);

        if (data.departmentId !== undefined) {
            await this.ensureDepartmentExists(data.departmentId.trim());
        }

        const updateData: UpdateNurseData = {
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

        return this.nurseRepository.update(id, updateData);
    }

    async deleteNurse(id: string): Promise<void> {
        await this.ensureNurseExists(id);
        await this.nurseRepository.delete(id);
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
}
