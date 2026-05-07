import {
    InvoiceEntity,
    InvoiceReferenceEntity,
    InvoiceStatus,
} from './invoice.entity';

export interface CreateInvoiceData {
    patientId: string;
    amount: number;
    invoiceDate: Date;
    status: InvoiceStatus;
    description: string | null;
}

export interface UpdateInvoiceData {
    patientId?: string;
    amount?: number;
    invoiceDate?: Date;
    status?: InvoiceStatus;
    description?: string | null;
}

export interface FindInvoicesParams {
    patientId?: string;
    status?: InvoiceStatus;
}

export interface InvoiceRepository {
    create(data: CreateInvoiceData): Promise<InvoiceEntity>;
    findMany(params: FindInvoicesParams): Promise<InvoiceEntity[]>;
    findById(id: string): Promise<InvoiceEntity | null>;
    findPatientById(patientId: string): Promise<InvoiceReferenceEntity | null>;
    update(id: string, data: UpdateInvoiceData): Promise<InvoiceEntity>;
    getPaidRevenueTotal(): Promise<number>;
}
