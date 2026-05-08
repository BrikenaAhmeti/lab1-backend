import { z } from 'zod';
import {
    IsDefined,
    IsNotEmpty,
    IsString,
    IsPositive,
    MaxLength,
} from 'class-validator';
import { AppError } from '../../../shared/core/errors/app-error';
import {
    createPaginationQuerySchema,
    normalizeOptionalString,
} from '../../../shared/core/pagination';
import {
    HasMaxTwoDecimalPlaces,
    IsDateOnlyString,
    NormalizeNullableString,
    NormalizeNumber,
    NormalizeString,
    OptionalField,
    OptionalNullableField,
} from '../../../shared/validation/decorators';
import {
    assertAtLeastOneField,
    validateDto,
} from '../../../shared/validation/validate-dto';
import { InvoiceStatus } from '../domain/invoice.entity';

const invoiceDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const invoiceStatusValues = ['PENDING', 'PAID', 'CANCELLED'] as const;
const invoiceSortByValues = ['created_at', 'date', 'amount', 'status'] as const;

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
        ...value,
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

export class CreateInvoiceDto {
    static normalize(input: unknown) {
        return normalizeInvoiceInput(input);
    }

    @IsDefined({ message: 'Patient id is required' })
    @IsString({ message: 'Patient id is required' })
    @NormalizeString('patient_id')
    @IsNotEmpty({ message: 'Patient id is required' })
    @MaxLength(255, {
        message: 'Patient id must not exceed 255 characters',
    })
    patientId!: string;

    @IsDefined({ message: 'Amount is required' })
    @NormalizeNumber('shuma')
    @IsPositive({
        message: 'Amount must be greater than 0',
    })
    @HasMaxTwoDecimalPlaces({
        message: 'Amount can have up to 2 decimal places',
    })
    amount!: number;

    @IsDefined({ message: 'Date is required' })
    @IsString({ message: 'Date is required' })
    @NormalizeString('data')
    @IsNotEmpty({ message: 'Date is required' })
    @IsDateOnlyString({
        message: 'Date must be in YYYY-MM-DD format',
    })
    date!: string;

    @OptionalNullableField()
    @IsString({ message: 'Description must be a string' })
    @NormalizeNullableString('pershkrimi')
    @MaxLength(4000, {
        message: 'Description must not exceed 4000 characters',
    })
    description?: string | null;
}

export class UpdateInvoiceDto {
    static normalize(input: unknown) {
        return normalizeInvoiceInput(input);
    }

    @OptionalField()
    @IsString({ message: 'Patient id is required' })
    @NormalizeString('patient_id')
    @IsNotEmpty({ message: 'Patient id is required' })
    @MaxLength(255, {
        message: 'Patient id must not exceed 255 characters',
    })
    patientId?: string;

    @OptionalField()
    @NormalizeNumber('shuma')
    @IsPositive({
        message: 'Amount must be greater than 0',
    })
    @HasMaxTwoDecimalPlaces({
        message: 'Amount can have up to 2 decimal places',
    })
    amount?: number;

    @OptionalField()
    @IsString({ message: 'Date is required' })
    @NormalizeString('data')
    @IsNotEmpty({ message: 'Date is required' })
    @IsDateOnlyString({
        message: 'Date must be in YYYY-MM-DD format',
    })
    date?: string;

    @OptionalNullableField()
    @IsString({ message: 'Description must be a string' })
    @NormalizeNullableString('pershkrimi')
    @MaxLength(4000, {
        message: 'Description must not exceed 4000 characters',
    })
    description?: string | null;
}

const getInvoicesQuerySchema = z.preprocess(
    normalizeInvoiceQuery,
    createPaginationQuerySchema(invoiceSortByValues).extend({
        patientId: z.preprocess(
            normalizeOptionalString,
            z.string().max(255).optional(),
        ),
        status: z.preprocess(
            normalizeOptionalString,
            invoiceStatusSchema.optional(),
        ),
    }),
);

export type GetInvoicesQueryDto = z.infer<typeof getInvoicesQuerySchema>;

export function validateCreateInvoiceDto(input: unknown): CreateInvoiceDto {
    return validateDto(CreateInvoiceDto, input);
}

export function validateUpdateInvoiceDto(input: unknown): UpdateInvoiceDto {
    const dto = validateDto(UpdateInvoiceDto, input);

    assertAtLeastOneField(dto, ['patientId', 'amount', 'date', 'description']);

    return dto;
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
