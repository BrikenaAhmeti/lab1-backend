import {
    AdmissionEntity,
    AdmissionReferenceEntity,
    AdmissionRoomEntity,
    AdmissionStatus,
} from './admission.entity';
import { RoomStatus } from '../../rooms/domain/room.entity';

export interface CreateAdmissionData {
    patientId: string;
    roomId: string;
    admissionDate: Date;
    status: AdmissionStatus;
}

export interface UpdateAdmissionData {
    dischargeDate?: Date | null;
    status?: AdmissionStatus;
}

export interface FindAdmissionsParams {
    status?: AdmissionStatus;
    patientId?: string;
    roomId?: string;
}

export interface AdmissionRepository {
    create(data: CreateAdmissionData): Promise<AdmissionEntity>;
    findMany(params: FindAdmissionsParams): Promise<AdmissionEntity[]>;
    findById(id: string): Promise<AdmissionEntity | null>;
    findPatientById(patientId: string): Promise<AdmissionReferenceEntity | null>;
    findRoomById(roomId: string): Promise<AdmissionRoomEntity | null>;
    findActiveByPatientId(patientId: string): Promise<AdmissionEntity | null>;
    countActiveAdmissionsByRoomId(roomId: string): Promise<number>;
    update(id: string, data: UpdateAdmissionData): Promise<AdmissionEntity>;
    updateRoomStatus(roomId: string, status: RoomStatus): Promise<void>;
}
