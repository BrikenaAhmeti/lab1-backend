import {
    NurseDepartmentEntity,
    NurseEntity,
    NurseShift,
} from './nurse.entity';

export interface CreateNurseData {
    firstName: string;
    lastName: string;
    departmentId: string;
    shift: NurseShift;
}

export interface UpdateNurseData {
    firstName?: string;
    lastName?: string;
    departmentId?: string;
    shift?: NurseShift;
}

export interface NurseRepository {
    create(data: CreateNurseData): Promise<NurseEntity>;
    findMany(departmentId?: string): Promise<NurseEntity[]>;
    findById(id: string): Promise<NurseEntity | null>;
    findDepartmentById(
        departmentId: string,
    ): Promise<NurseDepartmentEntity | null>;
    update(id: string, data: UpdateNurseData): Promise<NurseEntity>;
    delete(id: string): Promise<NurseEntity>;
}
