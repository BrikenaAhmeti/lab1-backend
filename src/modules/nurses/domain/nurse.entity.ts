export interface NurseDepartmentEntity {
    id: string;
    name: string;
    location: string;
}

export type NurseShift = 'Morning' | 'Evening' | 'Night';

export interface NurseEntity {
    id: string;
    firstName: string;
    lastName: string;
    departmentId: string;
    shift: NurseShift;
    department: NurseDepartmentEntity;
    createdAt: Date;
    updatedAt: Date;
}
