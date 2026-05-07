import { z } from 'zod';
import { AppError } from '../../../shared/core/errors/app-error';
import { InvoiceStatus } from '../domain/invoice.entity';

const invoiceDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const invoiceStatusValues = ['PENDING', 'PAID', 'CANCELLED'] as const;

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

function requiredString(fieldName: string, maxLength: number) {
    return z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().trim().min(1, `${fieldName} is required`).max(maxLength),
    );
}

function isValidInvoiceDate(value: string) {
    if (!invoiceDateRegex.test(value)) {
        return false;
    }

    return !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

function normalizeInvoiceInput(input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return input;
    }

    const value = input as Record<string, unknown>;

    return {
        patientId: value.patientId ?? value.patient_id,
        amount: value.amount ?? value.shuma,
        date: value.date ?? value.data,
        description: value.description ?? value.pershkrimi,
    };
}

function normalizeInvoiceQuery(input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return input;
    }

    const value = input as Record<string, unknown>;

    return {
        patientId: value.patientId ?? value.patient_id,
        status: value.status ?? value.statusi,
    };
}

const amountSchema = z.preprocess(
    (value) => {
        if (typeof value === 'string') {
            const trimmedValue = value.trim();

            if (trimmedValue.length === 0) {
                return value;
            }

            return Number(trimmedValue);
        }

        return value;
    },
    z.number()
        .positive('Amount must be greater than 0')
        .refine((value) => Number.isInteger(value * 100), {
            message: 'Amount can have up to 2 decimal places',
        }),
);

const invoiceDateSchema = z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : ''),
    z.string()
        .min(1, 'Date is required')
        .refine(isValidInvoiceDate, {
            message: 'Date must be in YYYY-MM-DD format',
        }),
);

const descriptionSchema = z.preprocess(
    (value) => {
        if (value === null) {
            return null;
        }

        if (typeof value === 'string') {
            return value;
        }

        return undefined;
    },
    z.union([z.string().trim().max(4000), z.null()]).optional(),
);

const invoiceStatusSchema = z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toUpperCase() : ''),
    z.string()
        .min(1, 'Status is required')
        .refine(
            (value): value is InvoiceStatus =>
                invoiceStatusValues.includes(
                    value as (typeof invoiceStatusValues)[number],
                ),
            {
                message: 'Status must be PENDING, PAID, or CANCELLED',
            },
        )
        .transform((value) => value as InvoiceStatus),
);

const createInvoiceSchema = z.preprocess(
    normalizeInvoiceInput,
    z.object({
        patientId: requiredString('Patient id', 255),
        amount: amountSchema,
        date: invoiceDateSchema,
        description: descriptionSchema,
    }),
);

const updateInvoiceSchema = z.preprocess(
    normalizeInvoiceInput,
    z.object({
        patientId: requiredString('Patient id', 255).optional(),
        amount: amountSchema.optional(),
        date: invoiceDateSchema.optional(),
        description: descriptionSchema,
    }).refine(
        (value) => Object.values(value).some((item) => item !== undefined),
        {
            message: 'At least one field is required',
        },
    ),
);

const getInvoicesQuerySchema = z.preprocess(
    normalizeInvoiceQuery,
    z.object({
        patientId: z.preprocess(
            (value) => (typeof value === 'string' ? value : undefined),
            z.string().trim().min(1, 'Patient id is required').max(255).optional(),
        ),
        status: z.preprocess(
            (value) => (typeof value === 'string' ? value : undefined),
            invoiceStatusSchema.optional(),
        ),
    }),
);

export type CreateInvoiceDto = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceDto = z.infer<typeof updateInvoiceSchema>;
export type GetInvoicesQueryDto = z.infer<typeof getInvoicesQuerySchema>;

export function validateCreateInvoiceDto(input: unknown): CreateInvoiceDto {
    const result = createInvoiceSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateUpdateInvoiceDto(input: unknown): UpdateInvoiceDto {
    const result = updateInvoiceSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateGetInvoicesQueryDto(input: unknown): GetInvoicesQueryDto {
    const result = getInvoicesQuerySchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateInvoiceId(input: unknown): string {
    const result = z.string().min(1, 'Invoice id is required').safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}
