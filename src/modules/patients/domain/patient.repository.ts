import { PatientEntity } from './patient.entity';

export interface CreatePatientData {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    phoneNumber: string;
    address: string;
    bloodType: string;
}

export interface UpdatePatientData {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    gender?: string;
    phoneNumber?: string;
    address?: string;
    bloodType?: string;
}

export interface PatientRepository {
    create(data: CreatePatientData): Promise<PatientEntity>;
    findById(id: string): Promise<PatientEntity | null>;
    findMany(): Promise<PatientEntity[]>;
    update(id: string, data: UpdatePatientData): Promise<PatientEntity>;
    softDelete(id: string): Promise<PatientEntity>;
}
