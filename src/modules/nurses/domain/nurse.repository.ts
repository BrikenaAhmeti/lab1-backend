import {
    NurseDepartmentEntity,
    NurseEntity,
    NurseShift,
} from './nurse.entity';

export interface CreateNurseData {
    userId: string | null;
    firstName: string;
    lastName: string;
    departmentId: string;
    shift: NurseShift;
}

export interface UpdateNurseData {
    userId?: string | null;
    firstName?: string;
    lastName?: string;
    departmentId?: string;
    shift?: NurseShift;
}

export interface NurseListFilters {
    departmentId?: string;
    search?: string;
    shift?: NurseShift;
}

export interface NurseUserEntity {
    id: string;
}

export interface NurseRepository {
    create(data: CreateNurseData): Promise<NurseEntity>;
    findMany(filters?: NurseListFilters): Promise<NurseEntity[]>;
    findById(id: string): Promise<NurseEntity | null>;
    findByUserId(userId: string): Promise<NurseEntity | null>;
    findUserById(userId: string): Promise<NurseUserEntity | null>;
    findDepartmentById(
        departmentId: string,
    ): Promise<NurseDepartmentEntity | null>;
    update(id: string, data: UpdateNurseData): Promise<NurseEntity>;
    delete(id: string): Promise<NurseEntity>;
}
