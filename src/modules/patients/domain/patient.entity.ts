import type { PaginatedResponse } from '../../../shared/core/pagination';

export interface PatientEntity {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    phoneNumber: string;
    address: string;
    bloodType: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type PatientListResponse = PaginatedResponse<PatientEntity>;
