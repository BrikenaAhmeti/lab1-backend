import { AppError } from '../../../shared/core/errors/app-error';
import {
    PaginatedResponse,
    paginateItems,
    sortItems,
} from '../../../shared/core/pagination';
import { InvoiceEntity, InvoiceStatsEntity } from '../domain/invoice.entity';
import { InvoiceRepository, UpdateInvoiceData } from '../domain/invoice.repository';
import {
    CreateInvoiceDto,
    GetInvoicesQueryDto,
    UpdateInvoiceDto,
} from '../dto/invoice.dto';

const invoiceSortAccessors = {
    created_at: (invoice: InvoiceEntity) => invoice.createdAt,
    date: (invoice: InvoiceEntity) => invoice.invoiceDate,
    amount: (invoice: InvoiceEntity) => invoice.amount,
    status: (invoice: InvoiceEntity) => invoice.status,
} as const;

export class InvoiceService {
    constructor(private readonly invoiceRepository: InvoiceRepository) { }

    async createInvoice(data: CreateInvoiceDto): Promise<InvoiceEntity> {
        const patientId = data.patientId.trim();

        await this.ensurePatientExists(patientId);
        this.ensureSingleCareEventLink(data.appointmentId, data.admissionId);

        const appointmentId = await this.resolveAppointmentId(
            data.appointmentId,
            patientId,
        );
        const admissionId = await this.resolveAdmissionId(
            data.admissionId,
            patientId,
        );

        return this.invoiceRepository.create({
            patientId,
            appointmentId,
            admissionId,
            amount: data.amount,
            invoiceDate: this.toInvoiceDate(data.date),
            status: 'PENDING',
            description: this.normalizeDescription(data.description),
        });
    }

    async getInvoices(
        data: GetInvoicesQueryDto,
    ): Promise<PaginatedResponse<InvoiceEntity>> {
        const patientId = data.patientId?.trim();

        if (patientId) {
            await this.ensurePatientExists(patientId);
        }

        const invoices = await this.invoiceRepository.findMany({
            ...(patientId ? { patientId } : {}),
            ...(data.status ? { status: data.status } : {}),
        });

        const sortedInvoices = sortItems(
            invoices,
            data.sortBy,
            data.order,
            invoiceSortAccessors,
        );

        return paginateItems(sortedInvoices, data.page, data.limit);
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
        const nextAppointmentId = data.appointmentId !== undefined
            ? data.appointmentId
            : invoice.appointmentId;
        const nextAdmissionId = data.admissionId !== undefined
            ? data.admissionId
            : invoice.admissionId;

        if (data.patientId !== undefined) {
            patientId = data.patientId.trim();
            await this.ensurePatientExists(patientId);
        }

        this.ensureSingleCareEventLink(nextAppointmentId, nextAdmissionId);

        const appointmentId = data.appointmentId !== undefined
            ? await this.resolveAppointmentId(data.appointmentId, patientId)
            : undefined;
        const admissionId = data.admissionId !== undefined
            ? await this.resolveAdmissionId(data.admissionId, patientId)
            : undefined;

        if (data.patientId !== undefined) {
            if (nextAppointmentId) {
                await this.resolveAppointmentId(nextAppointmentId, patientId);
            }

            if (nextAdmissionId) {
                await this.resolveAdmissionId(nextAdmissionId, patientId);
            }
        }

        const updateData: UpdateInvoiceData = {
            ...(data.patientId !== undefined ? { patientId } : {}),
            ...(data.appointmentId !== undefined ? { appointmentId } : {}),
            ...(data.admissionId !== undefined ? { admissionId } : {}),
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

    private async resolveAppointmentId(
        appointmentId: string | null | undefined,
        patientId: string,
    ): Promise<string | null> {
        if (appointmentId === undefined || appointmentId === null) {
            return null;
        }

        const normalizedAppointmentId = appointmentId.trim();
        const appointment = await this.invoiceRepository.findAppointmentById(
            normalizedAppointmentId,
        );

        if (!appointment) {
            throw new AppError('Appointment not found', 404);
        }

        if (appointment.patientId !== patientId) {
            throw new AppError('Appointment does not belong to patient', 400);
        }

        return normalizedAppointmentId;
    }

    private async resolveAdmissionId(
        admissionId: string | null | undefined,
        patientId: string,
    ): Promise<string | null> {
        if (admissionId === undefined || admissionId === null) {
            return null;
        }

        const normalizedAdmissionId = admissionId.trim();
        const admission = await this.invoiceRepository.findAdmissionById(
            normalizedAdmissionId,
        );

        if (!admission) {
            throw new AppError('Admission not found', 404);
        }

        if (admission.patientId !== patientId) {
            throw new AppError('Admission does not belong to patient', 400);
        }

        return normalizedAdmissionId;
    }

    private ensureSingleCareEventLink(
        appointmentId: string | null | undefined,
        admissionId: string | null | undefined,
    ): void {
        if (appointmentId && admissionId) {
            throw new AppError(
                'Invoice can be linked to either an appointment or an admission',
                400,
            );
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
