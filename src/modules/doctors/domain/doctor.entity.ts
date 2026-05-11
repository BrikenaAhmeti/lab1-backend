export interface DoctorDepartmentEntity {
    id: string;
    name: string;
    location: string;
}

export interface DoctorUserEntity {
    id: string;
}

export interface DoctorEntity {
    id: string;
    userId: string | null;
    firstName: string;
    lastName: string;
    specialization: string;
    departmentId: string;
    phoneNumber: string;
    isActive: boolean;
    department: DoctorDepartmentEntity;
    createdAt: Date;
    updatedAt: Date;
}
