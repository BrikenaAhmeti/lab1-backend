export interface DepartmentEntity {
    id: string;
    name: string;
    description?: string | null;
    location: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface DepartmentDoctorEntity {
    id: string;
    userId: string | null;
    firstName: string;
    lastName: string;
    specialization: string;
    departmentId: string;
    phoneNumber: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DepartmentRoomEntity {
    id: string;
    roomNumber: string;
    departmentId: string;
    type: string;
    status: string;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface DepartmentNurseEntity {
    id: string;
    firstName: string;
    lastName: string;
    departmentId: string;
    shift: string;
    createdAt: Date;
    updatedAt: Date;
}
