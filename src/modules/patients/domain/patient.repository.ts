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

export interface PatientRepository {
    create(data: CreatePatientData): Promise<PatientEntity>;
    findById(id: string): Promise<PatientEntity | null>;
    findByUserId(userId: string): Promise<PatientEntity | null>;
    findUserById(userId: string): Promise<PatientUserEntity | null>;
    findMany(): Promise<PatientEntity[]>;
    update(id: string, data: UpdatePatientData): Promise<PatientEntity>;
    softDelete(id: string): Promise<PatientEntity>;
}
