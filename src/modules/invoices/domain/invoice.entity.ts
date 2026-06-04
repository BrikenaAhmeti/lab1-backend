export type InvoiceStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface InvoiceReferenceEntity {
    id: string;
}

export interface InvoiceCareEventReferenceEntity extends InvoiceReferenceEntity {
    patientId: string;
}

export interface InvoicePatientEntity extends InvoiceReferenceEntity {
    firstName: string;
    lastName: string;
}

export interface InvoiceEntity extends InvoiceReferenceEntity {
    patientId: string;
    appointmentId: string | null;
    admissionId: string | null;
    amount: number;
    invoiceDate: Date;
    status: InvoiceStatus;
    description: string | null;
    patient: InvoicePatientEntity;
    createdAt: Date;
    updatedAt: Date;
}

export interface InvoiceStatsEntity {
    totalRevenue: number;
}
