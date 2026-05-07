import { AppError } from '../../../shared/core/errors/app-error';
import { InvoiceEntity, InvoiceStatsEntity } from '../domain/invoice.entity';
import { InvoiceRepository, UpdateInvoiceData } from '../domain/invoice.repository';
import {
    CreateInvoiceDto,
    GetInvoicesQueryDto,
    UpdateInvoiceDto,
} from '../dto/invoice.dto';

export class InvoiceService {
    constructor(private readonly invoiceRepository: InvoiceRepository) { }

    async createInvoice(data: CreateInvoiceDto): Promise<InvoiceEntity> {
        const patientId = data.patientId.trim();

        await this.ensurePatientExists(patientId);

        return this.invoiceRepository.create({
            patientId,
            amount: data.amount,
            invoiceDate: this.toInvoiceDate(data.date),
            status: 'PENDING',
            description: this.normalizeDescription(data.description),
        });
    }

    async getInvoices(data: GetInvoicesQueryDto): Promise<InvoiceEntity[]> {
        const patientId = data.patientId?.trim();

        if (patientId) {
            await this.ensurePatientExists(patientId);
        }

        return this.invoiceRepository.findMany({
            ...(patientId ? { patientId } : {}),
            ...(data.status ? { status: data.status } : {}),
        });
    }

    async getInvoiceById(id: string): Promise<InvoiceEntity> {
        return this.ensureInvoiceExists(id);
    }

    async updateInvoice(
        id: string,
        data: UpdateInvoiceDto,
    ): Promise<InvoiceEntity> {
        const invoice = await this.ensureInvoiceExists(id);

        if (invoice.status !== 'PENDING') {
            throw new AppError('Only pending invoices can be updated', 400);
        }

        let patientId = invoice.patientId;

        if (data.patientId !== undefined) {
            patientId = data.patientId.trim();
            await this.ensurePatientExists(patientId);
        }

        const updateData: UpdateInvoiceData = {
            ...(data.patientId !== undefined ? { patientId } : {}),
            ...(data.amount !== undefined ? { amount: data.amount } : {}),
            ...(data.date !== undefined
                ? { invoiceDate: this.toInvoiceDate(data.date) }
                : {}),
            ...(data.description !== undefined
                ? {
                    description: this.normalizeDescription(data.description),
                }
                : {}),
        };

        return this.invoiceRepository.update(id, updateData);
    }

    async payInvoice(id: string): Promise<InvoiceEntity> {
        const invoice = await this.ensureInvoiceExists(id);

        if (invoice.status === 'PAID') {
            return invoice;
        }

        if (invoice.status === 'CANCELLED') {
            throw new AppError('Cancelled invoice cannot be paid', 400);
        }

        return this.invoiceRepository.update(id, {
            status: 'PAID',
        });
    }

    async cancelInvoice(id: string): Promise<void> {
        const invoice = await this.ensureInvoiceExists(id);

        if (invoice.status === 'CANCELLED') {
            return;
        }

        if (invoice.status === 'PAID') {
            throw new AppError('Paid invoice cannot be cancelled', 400);
        }

        await this.invoiceRepository.update(id, {
            status: 'CANCELLED',
        });
    }

    async getInvoiceStats(): Promise<InvoiceStatsEntity> {
        const totalRevenue = await this.invoiceRepository.getPaidRevenueTotal();

        return {
            totalRevenue,
        };
    }

    private async ensureInvoiceExists(id: string): Promise<InvoiceEntity> {
        const invoice = await this.invoiceRepository.findById(id);

        if (!invoice) {
            throw new AppError('Invoice not found', 404);
        }

        return invoice;
    }

    private async ensurePatientExists(patientId: string): Promise<void> {
        const patient = await this.invoiceRepository.findPatientById(patientId);

        if (!patient) {
            throw new AppError('Patient not found', 404);
        }
    }

    private toInvoiceDate(date: string): Date {
        return new Date(`${date}T00:00:00.000Z`);
    }

    private normalizeDescription(description?: string | null): string | null {
        if (description === null) {
            return null;
        }

        if (description === undefined) {
            return null;
        }

        const normalizedDescription = description.trim();

        return normalizedDescription.length > 0 ? normalizedDescription : null;
    }
}
