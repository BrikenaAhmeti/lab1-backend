import { prisma } from '../../../infrastructure/db/prisma';
import {
    InvoiceEntity,
    InvoicePatientEntity,
    InvoiceStatus,
} from '../domain/invoice.entity';
import {
    CreateInvoiceData,
    FindInvoicesParams,
    InvoiceRepository,
    UpdateInvoiceData,
} from '../domain/invoice.repository';

const invoiceInclude = {
    patient: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
        },
    },
} as const;

function toAmount(value: { toNumber: () => number } | number | string): number {
    if (typeof value === 'number') {
        return value;
    }

    if (typeof value === 'string') {
        return Number(value);
    }

    return value.toNumber();
}

function toInvoiceEntity(invoice: {
    id: string;
    patientId: string;
    amount: { toNumber: () => number } | number | string;
    invoiceDate: Date;
    status: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    patient: InvoicePatientEntity;
}): InvoiceEntity {
    return {
        ...invoice,
        amount: toAmount(invoice.amount),
        status: invoice.status as InvoiceStatus,
    };
}

export class InvoicePrismaRepository implements InvoiceRepository {
    async create(data: CreateInvoiceData): Promise<InvoiceEntity> {
        const invoice = await prisma.invoice.create({
            data,
            include: invoiceInclude,
        });

        return toInvoiceEntity(invoice);
    }

    async findMany(params: FindInvoicesParams): Promise<InvoiceEntity[]> {
        const invoices = await prisma.invoice.findMany({
            where: {
                ...(params.patientId ? { patientId: params.patientId } : {}),
                ...(params.status ? { status: params.status } : {}),
            },
            include: invoiceInclude,
            orderBy: [
                {
                    invoiceDate: 'desc',
                },
                {
                    createdAt: 'desc',
                },
            ],
        });

        return invoices.map(toInvoiceEntity);
    }

    async findById(id: string): Promise<InvoiceEntity | null> {
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: invoiceInclude,
        });

        return invoice ? toInvoiceEntity(invoice) : null;
    }

    async findPatientById(patientId: string): Promise<{ id: string } | null> {
        return prisma.patient.findFirst({
            where: {
                id: patientId,
                isDeleted: false,
            },
            select: {
                id: true,
            },
        });
    }

    async update(id: string, data: UpdateInvoiceData): Promise<InvoiceEntity> {
        const invoice = await prisma.invoice.update({
            where: { id },
            data,
            include: invoiceInclude,
        });

        return toInvoiceEntity(invoice);
    }

    async getPaidRevenueTotal(): Promise<number> {
        const result = await prisma.invoice.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                status: 'PAID',
            },
        });

        return result._sum.amount === null
            ? 0
            : toAmount(result._sum.amount as { toNumber: () => number } | number | string);
    }
}
