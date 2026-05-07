import { z } from 'zod';
import { AppError } from '../../../shared/core/errors/app-error';
import { AdmissionStatus } from '../domain/admission.entity';

const admissionStatusValues = ['ACTIVE', 'DISCHARGED'] as const;

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

function requiredString(fieldName: string, maxLength: number) {
    return z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().trim().min(1, `${fieldName} is required`).max(maxLength),
    );
}

function optionalDateString(fieldName: string) {
    return z.preprocess(
        (value) => (typeof value === 'string' ? value.trim() : undefined),
        z.string()
            .min(1, `${fieldName} is required`)
            .refine((value) => !Number.isNaN(new Date(value).getTime()), {
                message: `${fieldName} is invalid`,
            })
            .optional(),
    );
}

const admissionStatusSchema = z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toUpperCase() : ''),
    z.string()
        .min(1, 'Status is required')
        .refine(
            (value): value is AdmissionStatus =>
                admissionStatusValues.includes(
                    value as (typeof admissionStatusValues)[number],
                ),
            {
                message: 'Status must be ACTIVE or DISCHARGED',
            },
        )
        .transform((value) => value as AdmissionStatus),
);

const createAdmissionSchema = z.object({
    patientId: requiredString('Patient id', 255),
    roomId: requiredString('Room id', 255),
    admissionDate: optionalDateString('Admission date'),
});

const dischargeAdmissionSchema = z.object({
    dischargeDate: optionalDateString('Discharge date'),
});

const getAdmissionsQuerySchema = z.object({
    status: z.preprocess(
        (value) => (typeof value === 'string' ? value : undefined),
        admissionStatusSchema.optional(),
    ),
    patientId: z.preprocess(
        (value) => (typeof value === 'string' ? value : undefined),
        z.string().trim().min(1, 'Patient id is required').max(255).optional(),
    ),
    roomId: z.preprocess(
        (value) => (typeof value === 'string' ? value : undefined),
        z.string().trim().min(1, 'Room id is required').max(255).optional(),
    ),
});

export type CreateAdmissionDto = z.infer<typeof createAdmissionSchema>;
export type DischargeAdmissionDto = z.infer<typeof dischargeAdmissionSchema>;
export type GetAdmissionsQueryDto = z.infer<typeof getAdmissionsQuerySchema>;

export function validateCreateAdmissionDto(input: unknown): CreateAdmissionDto {
    const result = createAdmissionSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateDischargeAdmissionDto(
    input: unknown,
): DischargeAdmissionDto {
    const result = dischargeAdmissionSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateGetAdmissionsQueryDto(
    input: unknown,
): GetAdmissionsQueryDto {
    const result = getAdmissionsQuerySchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateAdmissionId(input: unknown): string {
    const result = z.string().min(1, 'Admission id is required').safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}
