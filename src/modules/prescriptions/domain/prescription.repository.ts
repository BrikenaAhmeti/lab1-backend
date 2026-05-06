import {
    PrescriptionEntity,
    PrescriptionReferenceEntity,
} from './prescription.entity';

export interface CreatePrescriptionData {
    medicalRecordId: string;
    medicine: string;
    dosage: string;
    duration: string;
    instructions: string | null;
}

export interface UpdatePrescriptionData {
    medicalRecordId?: string;
    medicine?: string;
    dosage?: string;
    duration?: string;
    instructions?: string | null;
}

export interface PrescriptionRepository {
    create(data: CreatePrescriptionData): Promise<PrescriptionEntity>;
    findManyByMedicalRecordId(medicalRecordId: string): Promise<PrescriptionEntity[]>;
    findById(id: string): Promise<PrescriptionEntity | null>;
    findMedicalRecordById(
        id: string,
    ): Promise<PrescriptionReferenceEntity | null>;
    update(id: string, data: UpdatePrescriptionData): Promise<PrescriptionEntity>;
    delete(id: string): Promise<PrescriptionEntity>;
}
