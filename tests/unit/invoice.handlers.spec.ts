import { AppError } from '../../src/shared/core/errors/app-error';
import { CreateInvoiceCommand } from '../../src/modules/invoices/application/commands/create-invoice.command';
import { DeleteInvoiceCommand } from '../../src/modules/invoices/application/commands/delete-invoice.command';
import { PayInvoiceCommand } from '../../src/modules/invoices/application/commands/pay-invoice.command';
import { UpdateInvoiceCommand } from '../../src/modules/invoices/application/commands/update-invoice.command';
import { CreateInvoiceHandler } from '../../src/modules/invoices/application/handlers/create-invoice.handler';
import { DeleteInvoiceHandler } from '../../src/modules/invoices/application/handlers/delete-invoice.handler';
import { GetInvoiceStatsHandler } from '../../src/modules/invoices/application/handlers/get-invoice-stats.handler';
import { PayInvoiceHandler } from '../../src/modules/invoices/application/handlers/pay-invoice.handler';
import { UpdateInvoiceHandler } from '../../src/modules/invoices/application/handlers/update-invoice.handler';
import { GetInvoiceStatsQuery } from '../../src/modules/invoices/application/queries/get-invoice-stats.query';
import {
    InvoiceEntity,
    InvoicePatientEntity,
    InvoiceReferenceEntity,
} from '../../src/modules/invoices/domain/invoice.entity';
import { InvoiceRepository } from '../../src/modules/invoices/domain/invoice.repository';
import { InvoiceService } from '../../src/modules/invoices/services/invoice.service';

function createPatient(
    overrides: Partial<InvoicePatientEntity> = {},
): InvoicePatientEntity {
    return {
        id: overrides.id ?? 'patient-1',
        firstName: overrides.firstName ?? 'Ana',
        lastName: overrides.lastName ?? 'Berisha',
    };
}

function createPatientReference(
    overrides: Partial<InvoiceReferenceEntity> = {},
): InvoiceReferenceEntity {
    return {
        id: overrides.id ?? 'patient-1',
    };
}

function createInvoice(
    overrides: Partial<InvoiceEntity> = {},
): InvoiceEntity {
    return {
        id: overrides.id ?? 'invoice-1',
        patientId: overrides.patientId ?? 'patient-1',
        amount: overrides.amount ?? 150.75,
        invoiceDate: overrides.invoiceDate ?? new Date('2026-05-07T00:00:00.000Z'),
        status: overrides.status ?? 'PENDING',
        description: overrides.description ?? 'Room charge',
        patient: overrides.patient ?? createPatient(),
        createdAt: overrides.createdAt ?? new Date('2026-05-07T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-05-07T10:00:00.000Z'),
    };
}

describe('Invoice handlers', () => {
    const repository: jest.Mocked<InvoiceRepository> = {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        findPatientById: jest.fn(),
        update: jest.fn(),
        getPaidRevenueTotal: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create an invoice for an existing patient', async () => {
        repository.findPatientById.mockResolvedValue(createPatientReference());
        repository.create.mockResolvedValue(createInvoice());

        const service = new InvoiceService(repository);
        const handler = new CreateInvoiceHandler(service);
        const result = await handler.execute(
            new CreateInvoiceCommand({
                patientId: ' patient-1 ',
                amount: 150.75,
                date: '2026-05-07',
                description: ' Room charge ',
            }),
        );

        expect(repository.findPatientById).toHaveBeenCalledWith('patient-1');
        expect(repository.create).toHaveBeenCalledWith({
            patientId: 'patient-1',
            amount: 150.75,
            invoiceDate: new Date('2026-05-07T00:00:00.000Z'),
            status: 'PENDING',
            description: 'Room charge',
        });
        expect(result.id).toBe('invoice-1');
    });

    it('should reject invoice creation when the patient does not exist', async () => {
        repository.findPatientById.mockResolvedValue(null);

        const service = new InvoiceService(repository);
        const handler = new CreateInvoiceHandler(service);

        await expect(
            handler.execute(
                new CreateInvoiceCommand({
                    patientId: 'patient-1',
                    amount: 90,
                    date: '2026-05-07',
                }),
            ),
        ).rejects.toMatchObject({
            message: 'Patient not found',
            statusCode: 404,
        });

        expect(repository.create).not.toHaveBeenCalled();
    });

    it('should update a pending invoice', async () => {
        repository.findById.mockResolvedValue(createInvoice());
        repository.update.mockResolvedValue(createInvoice({
            amount: 200,
            description: 'Updated charge',
        }));

        const service = new InvoiceService(repository);
        const handler = new UpdateInvoiceHandler(service);
        const result = await handler.execute(
            new UpdateInvoiceCommand('invoice-1', {
                amount: 200,
                description: ' Updated charge ',
            }),
        );

        expect(repository.update).toHaveBeenCalledWith('invoice-1', {
            amount: 200,
            description: 'Updated charge',
        });
        expect(result.amount).toBe(200);
    });

    it('should reject updates for paid invoices', async () => {
        repository.findById.mockResolvedValue(createInvoice({
            status: 'PAID',
        }));

        const service = new InvoiceService(repository);
        const handler = new UpdateInvoiceHandler(service);

        await expect(
            handler.execute(
                new UpdateInvoiceCommand('invoice-1', {
                    amount: 200,
                }),
            ),
        ).rejects.toBeInstanceOf(AppError);

        expect(repository.update).not.toHaveBeenCalled();
    });

    it('should pay a pending invoice', async () => {
        repository.findById.mockResolvedValue(createInvoice());
        repository.update.mockResolvedValue(createInvoice({
            status: 'PAID',
        }));

        const service = new InvoiceService(repository);
        const handler = new PayInvoiceHandler(service);
        const result = await handler.execute(
            new PayInvoiceCommand('invoice-1'),
        );

        expect(repository.update).toHaveBeenCalledWith('invoice-1', {
            status: 'PAID',
        });
        expect(result.status).toBe('PAID');
    });

    it('should reject paying a cancelled invoice', async () => {
        repository.findById.mockResolvedValue(createInvoice({
            status: 'CANCELLED',
        }));

        const service = new InvoiceService(repository);
        const handler = new PayInvoiceHandler(service);

        await expect(
            handler.execute(
                new PayInvoiceCommand('invoice-1'),
            ),
        ).rejects.toMatchObject({
            message: 'Cancelled invoice cannot be paid',
            statusCode: 400,
        });

        expect(repository.update).not.toHaveBeenCalled();
    });

    it('should cancel a pending invoice', async () => {
        repository.findById.mockResolvedValue(createInvoice());
        repository.update.mockResolvedValue(createInvoice({
            status: 'CANCELLED',
        }));

        const service = new InvoiceService(repository);
        const handler = new DeleteInvoiceHandler(service);

        await handler.execute(new DeleteInvoiceCommand('invoice-1'));

        expect(repository.update).toHaveBeenCalledWith('invoice-1', {
            status: 'CANCELLED',
        });
    });

    it('should return paid revenue stats', async () => {
        repository.getPaidRevenueTotal.mockResolvedValue(430.25);

        const service = new InvoiceService(repository);
        const handler = new GetInvoiceStatsHandler(service);
        const result = await handler.execute(new GetInvoiceStatsQuery());

        expect(result).toEqual({
            totalRevenue: 430.25,
        });
    });
});
