import { PatientEntity } from './patient.entity';

export interface CreatePatientData {
    userId?: string | null;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    phoneNumber: string;
    address: string;
    bloodType: string;
}

export interface UpdatePatientData {
    userId?: string | null;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    gender?: string;
    phoneNumber?: string;
    address?: string;
    bloodType?: string;
}

export interface PatientUserEntity {
    id: string;
}

export interface PatientDoctorReferenceEntity {
    id: string;
    isActive: boolean;
}

export interface PatientRepository {
    create(data: CreatePatientData): Promise<PatientEntity>;
    findById(id: string): Promise<PatientEntity | null>;
    findByIdForDoctorAppointments(
        id: string,
        doctorId: string,
    ): Promise<PatientEntity | null>;
    findByUserId(userId: string): Promise<PatientEntity | null>;
    findUserById(userId: string): Promise<PatientUserEntity | null>;
    findDoctorByUserId(userId: string): Promise<PatientDoctorReferenceEntity | null>;
    findMany(): Promise<PatientEntity[]>;
    findManyForDoctorAppointments(doctorId: string): Promise<PatientEntity[]>;
    update(id: string, data: UpdatePatientData): Promise<PatientEntity>;
    softDelete(id: string): Promise<PatientEntity>;
}
