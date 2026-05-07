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
