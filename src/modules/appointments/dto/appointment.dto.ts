import { z } from 'zod';
import { AppError } from '../../../shared/core/errors/app-error';
import {
    createPaginationQuerySchema,
    normalizeOptionalString,
} from '../../../shared/core/pagination';
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

const createAppointmentSchema = z.object({
    patientId: requiredString('Patient id', 255),
    doctorId: requiredString('Doctor id', 255),
    date: appointmentDateSchema,
    time: appointmentTimeSchema,
    notes: z.preprocess(
        (value) => (typeof value === 'string' ? value : undefined),
        z.string().trim().max(1000).optional(),
    ),
});

const updateAppointmentSchema = z.object({
    patientId: requiredString('Patient id', 255).optional(),
    doctorId: requiredString('Doctor id', 255).optional(),
    date: appointmentDateSchema.optional(),
    time: appointmentTimeSchema.optional(),
    status: appointmentStatusSchema.optional(),
    notes: z.preprocess(
        (value) => {
            if (value === null) {
                return null;
            }

            if (typeof value === 'string') {
                return value;
            }

            return undefined;
        },
        z.union([z.string().trim().max(1000), z.null()]).optional(),
    ),
}).refine(
    (value) => Object.values(value).some((item) => item !== undefined),
    {
        message: 'At least one field is required',
    },
);

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

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentDto = z.infer<typeof updateAppointmentSchema>;
export type GetAppointmentsQueryDto = z.infer<typeof getAppointmentsQuerySchema>;

export function validateCreateAppointmentDto(
    input: unknown,
): CreateAppointmentDto {
    const result = createAppointmentSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateUpdateAppointmentDto(
    input: unknown,
): UpdateAppointmentDto {
    const result = updateAppointmentSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
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
