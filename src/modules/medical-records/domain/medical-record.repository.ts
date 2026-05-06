import {
    MedicalRecordEntity,
    MedicalRecordPrescriptionEntity,
    MedicalRecordReferenceEntity,
} from './medical-record.entity';

export interface CreateMedicalRecordData {
    patientId: string;
    doctorId: string;
    diagnosis: string;
    treatment: string;
    prescriptionsText: string | null;
    recordDate: Date;
}

export interface UpdateMedicalRecordData {
    patientId?: string;
    doctorId?: string;
    diagnosis?: string;
    treatment?: string;
    prescriptionsText?: string | null;
    recordDate?: Date;
}

export interface MedicalRecordRepository {
    create(data: CreateMedicalRecordData): Promise<MedicalRecordEntity>;
    findManyByPatientId(patientId: string): Promise<MedicalRecordEntity[]>;
    findById(id: string): Promise<MedicalRecordEntity | null>;
    findPatientById(id: string): Promise<MedicalRecordReferenceEntity | null>;
    findDoctorById(id: string): Promise<MedicalRecordReferenceEntity | null>;
    findPrescriptionsByMedicalRecordId(
        medicalRecordId: string,
    ): Promise<MedicalRecordPrescriptionEntity[]>;
    update(
        id: string,
        data: UpdateMedicalRecordData,
    ): Promise<MedicalRecordEntity>;
    delete(id: string): Promise<MedicalRecordEntity>;
}
