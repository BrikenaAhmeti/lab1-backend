export interface MedicalRecordPatientEntity {
    id: string;
    firstName: string;
    lastName: string;
}

export interface MedicalRecordDoctorEntity {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
}

export interface MedicalRecordReferenceEntity {
    id: string;
    isActive?: boolean;
}

export interface MedicalRecordPrescriptionEntity {
    id: string;
    medicalRecordId: string;
    medicine: string;
    dosage: string;
    duration: string;
    instructions: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface MedicalRecordEntity {
    id: string;
    patientId: string;
    doctorId: string;
    diagnosis: string;
    treatment: string;
    prescriptionsText: string | null;
    recordDate: Date;
    patient: MedicalRecordPatientEntity;
    doctor: MedicalRecordDoctorEntity;
    createdAt: Date;
    updatedAt: Date;
}
