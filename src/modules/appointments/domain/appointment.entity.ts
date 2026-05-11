export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface AppointmentPatientEntity {
    id: string;
    firstName: string;
    lastName: string;
}

export interface AppointmentDoctorEntity {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
}

export interface AppointmentReferenceEntity {
    id: string;
    isActive?: boolean;
}

export interface AppointmentEntity {
    id: string;
    patientId: string;
    doctorId: string;
    appointmentDate: Date;
    appointmentTime: string;
    status: string;
    notes: string | null;
    patient: AppointmentPatientEntity;
    doctor: AppointmentDoctorEntity;
    createdAt: Date;
    updatedAt: Date;
}
