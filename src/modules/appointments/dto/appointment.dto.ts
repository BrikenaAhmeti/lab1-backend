import { z } from 'zod';
import {
    IsDefined,
    IsIn,
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';
import { AppError } from '../../../shared/core/errors/app-error';
import {
    createPaginationQuerySchema,
    normalizeOptionalString,
} from '../../../shared/core/pagination';
import {
    IsDateOnlyString,
    IsTimeString,
    NormalizeNullableString,
    NormalizeString,
    OptionalField,
    OptionalNullableField,
} from '../../../shared/validation/decorators';
import {
    assertAtLeastOneField,
    validateDto,
} from '../../../shared/validation/validate-dto';
import { AppointmentStatus } from '../domain/appointment.entity';

const appointmentStatusValues = [
    'Scheduled',
    'Completed',
    'Cancelled',
] as const;
const appointmentSortByValues = [
    'created_at',
    'date',
    'time',
    'status',
] as const;
const appointmentDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const appointmentTimeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

function requiredString(fieldName: string, maxLength: number) {
    return z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().trim().min(1, `${fieldName} is required`).max(maxLength),
    );
}

function isValidAppointmentDate(value: string) {
    if (!appointmentDateRegex.test(value)) {
        return false;
    }

    return !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

const appointmentDateSchema = z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : ''),
    z.string()
        .min(1, 'Date is required')
        .refine(isValidAppointmentDate, {
            message: 'Date must be in YYYY-MM-DD format',
        }),
);

const appointmentTimeSchema = z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : ''),
    z.string().regex(appointmentTimeRegex, {
        message: 'Time must be in HH:mm format',
    }),
);

const appointmentStatusSchema = z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : ''),
    z.string()
        .min(1, 'Status is required')
        .refine(
            (value): value is AppointmentStatus =>
                appointmentStatusValues.includes(
                    value as (typeof appointmentStatusValues)[number],
                ),
            {
                message: 'Status must be Scheduled, Completed, or Cancelled',
            },
        )
        .transform((value) => value as AppointmentStatus),
);

export class CreateAppointmentDto {
    @IsDefined({ message: 'Patient id is required' })
    @IsString({ message: 'Patient id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Patient id is required' })
    @MaxLength(255, {
        message: 'Patient id must not exceed 255 characters',
    })
    patientId!: string;

    @IsDefined({ message: 'Doctor id is required' })
    @IsString({ message: 'Doctor id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Doctor id is required' })
    @MaxLength(255, {
        message: 'Doctor id must not exceed 255 characters',
    })
    doctorId!: string;

    @IsDefined({ message: 'Date is required' })
    @IsString({ message: 'Date is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Date is required' })
    @IsDateOnlyString({
        message: 'Date must be in YYYY-MM-DD format',
    })
    date!: string;

    @IsDefined({ message: 'Time is required' })
    @IsString({ message: 'Time is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Time is required' })
    @IsTimeString({
        message: 'Time must be in HH:mm format',
    })
    time!: string;

    @OptionalField()
    @IsString({ message: 'Notes must be a string' })
    @NormalizeString()
    @MaxLength(1000, {
        message: 'Notes must not exceed 1000 characters',
    })
    notes?: string;
}

export class UpdateAppointmentDto {
    @OptionalField()
    @IsString({ message: 'Patient id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Patient id is required' })
    @MaxLength(255, {
        message: 'Patient id must not exceed 255 characters',
    })
    patientId?: string;

    @OptionalField()
    @IsString({ message: 'Doctor id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Doctor id is required' })
    @MaxLength(255, {
        message: 'Doctor id must not exceed 255 characters',
    })
    doctorId?: string;

    @OptionalField()
    @IsString({ message: 'Date is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Date is required' })
    @IsDateOnlyString({
        message: 'Date must be in YYYY-MM-DD format',
    })
    date?: string;

    @OptionalField()
    @IsString({ message: 'Time is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Time is required' })
    @IsTimeString({
        message: 'Time must be in HH:mm format',
    })
    time?: string;

    @OptionalField()
    @IsString({ message: 'Status is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Status is required' })
    @IsIn(appointmentStatusValues, {
        message: 'Status must be Scheduled, Completed, or Cancelled',
    })
    status?: AppointmentStatus;

    @OptionalNullableField()
    @IsString({ message: 'Notes must be a string' })
    @NormalizeNullableString()
    @MaxLength(1000, {
        message: 'Notes must not exceed 1000 characters',
    })
    notes?: string | null;
}

const getAppointmentsQuerySchema = createPaginationQuerySchema(
    appointmentSortByValues,
).extend({
    date: z.preprocess(
        normalizeOptionalString,
        appointmentDateSchema.optional(),
    ),
    doctorId: z.preprocess(
        normalizeOptionalString,
        z.string().max(255).optional(),
    ),
    patientId: z.preprocess(
        normalizeOptionalString,
        z.string().max(255).optional(),
    ),
    status: z.preprocess(
        normalizeOptionalString,
        appointmentStatusSchema.optional(),
    ),
    from: z.preprocess(
        normalizeOptionalString,
        appointmentDateSchema.optional(),
    ),
    to: z.preprocess(
        normalizeOptionalString,
        appointmentDateSchema.optional(),
    ),
}).refine(
    (value) => !value.from || !value.to || value.from <= value.to,
    {
        message: 'from date cannot be after to date',
        path: ['from'],
    },
);

export type GetAppointmentsQueryDto = z.infer<typeof getAppointmentsQuerySchema>;

export function validateCreateAppointmentDto(
    input: unknown,
): CreateAppointmentDto {
    return validateDto(CreateAppointmentDto, input);
}

export function validateUpdateAppointmentDto(
    input: unknown,
): UpdateAppointmentDto {
    const dto = validateDto(UpdateAppointmentDto, input);

    assertAtLeastOneField(
        dto,
        ['patientId', 'doctorId', 'date', 'time', 'status', 'notes'],
    );

    return dto;
}

export function validateGetAppointmentsQueryDto(
    input: unknown,
): GetAppointmentsQueryDto {
    const result = getAppointmentsQuerySchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateAppointmentId(input: unknown): string {
    const result = z
        .string()
        .min(1, 'Appointment id is required')
        .safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}
