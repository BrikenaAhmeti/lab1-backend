import { z } from 'zod';
import { AppError } from '../../../shared/core/errors/app-error';
import { createPaginationQuerySchema } from '../../../shared/core/pagination';

const prescriptionSortByValues = ['created_at', 'medicine'] as const;

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

function requiredString(fieldName: string, maxLength: number) {
    return z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().trim().min(1, `${fieldName} is required`).max(maxLength),
    );
}

function normalizePrescriptionInput(input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return input;
    }

    const value = input as Record<string, unknown>;

    return {
        medicalRecordId: value.medicalRecordId ?? value.medical_record_id,
        medicine: value.medicine ?? value.bari,
        dosage: value.dosage ?? value.dozimi,
        duration: value.duration ?? value.kohezgjatja,
        instructions: value.instructions ?? value.udhezime,
    };
}

function normalizePrescriptionQuery(input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return input;
    }

    const value = input as Record<string, unknown>;

    return {
        ...value,
        medicalRecordId: value.medicalRecordId ?? value.medical_record_id,
    };
}

const instructionsSchema = z.preprocess(
    (value) => {
        if (value === null) {
            return null;
        }

        if (typeof value === 'string') {
            return value;
        }

        return undefined;
    },
    z.union([z.string().trim().max(2000), z.null()]).optional(),
);

const createPrescriptionSchema = z.preprocess(
    normalizePrescriptionInput,
    z.object({
        medicalRecordId: requiredString('Medical record id', 255),
        medicine: requiredString('Medicine', 255),
        dosage: requiredString('Dosage', 255),
        duration: requiredString('Duration', 255),
        instructions: instructionsSchema,
    }),
);

const updatePrescriptionSchema = z.preprocess(
    normalizePrescriptionInput,
    z.object({
        medicalRecordId: requiredString('Medical record id', 255).optional(),
        medicine: requiredString('Medicine', 255).optional(),
        dosage: requiredString('Dosage', 255).optional(),
        duration: requiredString('Duration', 255).optional(),
        instructions: instructionsSchema,
    }).refine(
        (value) => Object.values(value).some((item) => item !== undefined),
        {
            message: 'At least one field is required',
        },
    ),
);

const getPrescriptionsQuerySchema = z.preprocess(
    normalizePrescriptionQuery,
    createPaginationQuerySchema(prescriptionSortByValues).extend({
        medicalRecordId: requiredString('Medical record id', 255),
    }),
);

export type CreatePrescriptionDto = z.infer<typeof createPrescriptionSchema>;
export type UpdatePrescriptionDto = z.infer<typeof updatePrescriptionSchema>;
export type GetPrescriptionsQueryDto = z.infer<
    typeof getPrescriptionsQuerySchema
>;

export function validateCreatePrescriptionDto(
    input: unknown,
): CreatePrescriptionDto {
    const result = createPrescriptionSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateUpdatePrescriptionDto(
    input: unknown,
): UpdatePrescriptionDto {
    const result = updatePrescriptionSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateGetPrescriptionsQueryDto(
    input: unknown,
): GetPrescriptionsQueryDto {
    const result = getPrescriptionsQuerySchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validatePrescriptionId(input: unknown): string {
    const result = z
        .string()
        .min(1, 'Prescription id is required')
        .safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}
