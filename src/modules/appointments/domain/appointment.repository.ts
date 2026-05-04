import {
    AppointmentEntity,
    AppointmentReferenceEntity,
    AppointmentStatus,
} from './appointment.entity';

export interface CreateAppointmentData {
    patientId: string;
    doctorId: string;
    appointmentDate: Date;
    appointmentTime: string;
    status: AppointmentStatus;
    notes: string | null;
}

export interface UpdateAppointmentData {
    patientId?: string;
    doctorId?: string;
    appointmentDate?: Date;
    appointmentTime?: string;
    status?: AppointmentStatus;
    notes?: string | null;
}

export interface FindAppointmentsParams {
    appointmentDate?: Date;
    doctorId?: string;
    patientId?: string;
    status?: AppointmentStatus;
}

export interface FindAppointmentConflictParams {
    doctorId: string;
    appointmentDate: Date;
    appointmentTime: string;
    excludeAppointmentId?: string;
}

export interface AppointmentRepository {
    create(data: CreateAppointmentData): Promise<AppointmentEntity>;
    findMany(params: FindAppointmentsParams): Promise<AppointmentEntity[]>;
    findById(id: string): Promise<AppointmentEntity | null>;
    findPatientById(id: string): Promise<AppointmentReferenceEntity | null>;
    findDoctorById(id: string): Promise<AppointmentReferenceEntity | null>;
    findConflict(
        params: FindAppointmentConflictParams,
    ): Promise<AppointmentEntity | null>;
    update(id: string, data: UpdateAppointmentData): Promise<AppointmentEntity>;
}
