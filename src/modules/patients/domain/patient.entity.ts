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

export interface PatientListResponse {
    items: PatientEntity[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
