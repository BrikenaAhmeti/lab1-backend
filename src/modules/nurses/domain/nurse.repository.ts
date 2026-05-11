import {
    NurseDepartmentEntity,
    NurseEntity,
    NurseShift,
} from './nurse.entity';

export interface CreateNurseData {
    userId: string;
    firstName: string;
    lastName: string;
    departmentId: string;
    shift: NurseShift;
}

export interface UpdateNurseData {
    userId?: string;
    firstName?: string;
    lastName?: string;
    departmentId?: string;
    shift?: NurseShift;
}

export interface NurseUserEntity {
    id: string;
}

export interface NurseRepository {
    create(data: CreateNurseData): Promise<NurseEntity>;
    findMany(departmentId?: string): Promise<NurseEntity[]>;
    findById(id: string): Promise<NurseEntity | null>;
    findByUserId(userId: string): Promise<NurseEntity | null>;
    findUserById(userId: string): Promise<NurseUserEntity | null>;
    findDepartmentById(
        departmentId: string,
    ): Promise<NurseDepartmentEntity | null>;
    update(id: string, data: UpdateNurseData): Promise<NurseEntity>;
    delete(id: string): Promise<NurseEntity>;
}
