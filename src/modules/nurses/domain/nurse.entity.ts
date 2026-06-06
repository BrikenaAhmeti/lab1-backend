export interface NurseDepartmentEntity {
    id: string;
    name: string;
    location: string;
}

export interface NurseAccountEntity {
    id: string;
    email: string;
    username: string;
}

export type NurseShift = 'Morning' | 'Evening' | 'Night';

export interface NurseEntity {
    id: string;
    userId: string | null;
    firstName: string;
    lastName: string;
    departmentId: string;
    shift: NurseShift;
    department: NurseDepartmentEntity;
    user?: NurseAccountEntity | null;
    createdAt: Date;
    updatedAt: Date;
}
