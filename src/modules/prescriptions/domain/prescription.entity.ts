export interface PrescriptionReferenceEntity {
    id: string;
}

export interface PrescriptionEntity {
    id: string;
    medicalRecordId: string;
    medicine: string;
    dosage: string;
    duration: string;
    instructions: string | null;
    createdAt: Date;
    updatedAt: Date;
}
