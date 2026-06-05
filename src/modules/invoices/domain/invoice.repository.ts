import {
    InvoiceCareEventReferenceEntity,
    InvoiceEntity,
    InvoiceReferenceEntity,
    InvoiceStatus,
} from './invoice.entity';

export interface CreateInvoiceData {
    patientId: string;
    appointmentId: string | null;
    admissionId: string | null;
    amount: number;
    invoiceDate: Date;
    status: InvoiceStatus;
    description: string | null;
}

export interface UpdateInvoiceData {
    patientId?: string;
    appointmentId?: string | null;
    admissionId?: string | null;
    amount?: number;
    invoiceDate?: Date;
    status?: InvoiceStatus;
    description?: string | null;
}

export interface FindInvoicesParams {
    patientId?: string;
    status?: InvoiceStatus;
    invoiceDate?: {
        gte?: Date;
        lte?: Date;
    };
}

export interface InvoiceRepository {
    create(data: CreateInvoiceData): Promise<InvoiceEntity>;
    findMany(params: FindInvoicesParams): Promise<InvoiceEntity[]>;
    findById(id: string): Promise<InvoiceEntity | null>;
    findPatientById(patientId: string): Promise<InvoiceReferenceEntity | null>;
    findAppointmentById(
        appointmentId: string,
    ): Promise<InvoiceCareEventReferenceEntity | null>;
    findAdmissionById(
        admissionId: string,
    ): Promise<InvoiceCareEventReferenceEntity | null>;
    update(id: string, data: UpdateInvoiceData): Promise<InvoiceEntity>;
    getPaidRevenueTotal(): Promise<number>;
}
