import { RoomStatus, RoomType } from '../../rooms/domain/room.entity';

export type AdmissionStatus = 'ACTIVE' | 'DISCHARGED';

export interface AdmissionReferenceEntity {
    id: string;
}

export interface AdmissionPatientEntity extends AdmissionReferenceEntity {
    firstName: string;
    lastName: string;
}

export interface AdmissionRoomDepartmentEntity extends AdmissionReferenceEntity {
    name: string;
    location: string;
}

export interface AdmissionRoomEntity extends AdmissionReferenceEntity {
    roomNumber: string;
    departmentId: string;
    type: RoomType;
    status: RoomStatus;
    capacity: number;
    department: AdmissionRoomDepartmentEntity;
}

export interface AdmissionEntity extends AdmissionReferenceEntity {
    patientId: string;
    roomId: string;
    admissionDate: Date;
    dischargeDate: Date | null;
    status: AdmissionStatus;
    patient: AdmissionPatientEntity;
    room: AdmissionRoomEntity;
    createdAt: Date;
    updatedAt: Date;
}
