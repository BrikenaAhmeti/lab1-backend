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

export interface FindPatientsParams {
    page: number;
    limit: number;
    search?: string;
}

export interface FindPatientsResult {
    items: PatientEntity[];
    total: number;
}

export interface PatientRepository {
    create(data: CreatePatientData): Promise<PatientEntity>;
    findById(id: string): Promise<PatientEntity | null>;
    findMany(params: FindPatientsParams): Promise<FindPatientsResult>;
    update(id: string, data: UpdatePatientData): Promise<PatientEntity>;
    softDelete(id: string): Promise<PatientEntity>;
}
