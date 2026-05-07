export type InvoiceStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface InvoiceReferenceEntity {
    id: string;
}

export interface InvoicePatientEntity extends InvoiceReferenceEntity {
    firstName: string;
    lastName: string;
}

export interface InvoiceEntity extends InvoiceReferenceEntity {
    patientId: string;
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
