export type RoomType =
    | 'GENERAL'
    | 'ICU'
    | 'SURGERY'
    | 'EMERGENCY'
    | 'PEDIATRIC';

export type RoomStatus =
    | 'AVAILABLE'
    | 'OCCUPIED'
    | 'UNDER_MAINTENANCE';

export interface RoomDepartmentEntity {
    id: string;
    name: string;
    location: string;
}

export interface RoomStoredEntity {
    id: string;
    roomNumber: string;
    departmentId: string;
    type: RoomType;
    status: RoomStatus;
    capacity: number;
    department: RoomDepartmentEntity;
    createdAt: Date;
    updatedAt: Date;
}

export interface RoomEntity extends RoomStoredEntity {
    activeAdmissionsCount: number;
    availableCapacity: number;
}

export interface RoomAdmissionPatientEntity {
    id: string;
    firstName: string;
    lastName: string;
}

export interface RoomCurrentAdmissionEntity {
    id: string;
    patientId: string;
    roomId: string;
    admissionDate: Date;
    dischargeDate: Date | null;
    status: 'ACTIVE' | 'DISCHARGED';
    patient: RoomAdmissionPatientEntity;
}

export interface RoomDetailEntity extends RoomEntity {
    currentAdmissions: RoomCurrentAdmissionEntity[];
}
