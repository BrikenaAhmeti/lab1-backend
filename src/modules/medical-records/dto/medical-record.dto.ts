import { z } from 'zod';
import { AppError } from '../../../shared/core/errors/app-error';
import {
    createPaginationQuerySchema,
    normalizeOptionalString,
} from '../../../shared/core/pagination';

const medicalRecordDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const medicalRecordSortByValues = ['created_at', 'date'] as const;

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

function requiredString(fieldName: string, maxLength: number) {
    return z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().trim().min(1, `${fieldName} is required`).max(maxLength),
    );
}

function isValidMedicalRecordDate(value: string) {
    if (!medicalRecordDateRegex.test(value)) {
        return false;
    }

    return !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

function normalizeMedicalRecordInput(input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return input;
    }

    const value = input as Record<string, unknown>;

    return {
        patientId: value.patientId ?? value.patient_id,
        doctorId: value.doctorId ?? value.doctor_id,
        diagnosis: value.diagnosis ?? value.diagnoza,
        treatment: value.treatment ?? value.trajtimi,
        prescriptionsText:
            value.prescriptionsText
            ?? value.prescriptions_text
            ?? value.recetat,
        date: value.date ?? value.data,
    };
}

function normalizeMedicalRecordQuery(input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return input;
    }

    const value = input as Record<string, unknown>;

    return {
        ...value,
        patientId: value.patientId ?? value.patient_id,
    };
}

const medicalRecordDateSchema = z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : ''),
    z.string()
        .min(1, 'Date is required')
        .refine(isValidMedicalRecordDate, {
            message: 'Date must be in YYYY-MM-DD format',
        }),
);

const prescriptionsTextSchema = z.preprocess(
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

const createMedicalRecordSchema = z.preprocess(
    normalizeMedicalRecordInput,
    z.object({
        patientId: requiredString('Patient id', 255),
        doctorId: requiredString('Doctor id', 255),
        diagnosis: requiredString('Diagnosis', 2000),
        treatment: requiredString('Treatment', 4000),
        prescriptionsText: prescriptionsTextSchema,
        date: medicalRecordDateSchema,
    }),
);

const updateMedicalRecordSchema = z.preprocess(
    normalizeMedicalRecordInput,
    z.object({
        patientId: requiredString('Patient id', 255).optional(),
        doctorId: requiredString('Doctor id', 255).optional(),
        diagnosis: requiredString('Diagnosis', 2000).optional(),
        treatment: requiredString('Treatment', 4000).optional(),
        prescriptionsText: prescriptionsTextSchema,
        date: medicalRecordDateSchema.optional(),
    }).refine(
        (value) => Object.values(value).some((item) => item !== undefined),
        {
            message: 'At least one field is required',
        },
    ),
);

const getMedicalRecordsQuerySchema = z.preprocess(
    normalizeMedicalRecordQuery,
    createPaginationQuerySchema(medicalRecordSortByValues).extend({
        patientId: requiredString('Patient id', 255),
    }),
);

export type CreateMedicalRecordDto = z.infer<typeof createMedicalRecordSchema>;
export type UpdateMedicalRecordDto = z.infer<typeof updateMedicalRecordSchema>;
export type GetMedicalRecordsQueryDto = z.infer<
    typeof getMedicalRecordsQuerySchema
>;

export function validateCreateMedicalRecordDto(
    input: unknown,
): CreateMedicalRecordDto {
    const result = createMedicalRecordSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateUpdateMedicalRecordDto(
    input: unknown,
): UpdateMedicalRecordDto {
    const result = updateMedicalRecordSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateGetMedicalRecordsQueryDto(
    input: unknown,
): GetMedicalRecordsQueryDto {
    const result = getMedicalRecordsQuerySchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateMedicalRecordId(input: unknown): string {
    const result = z
        .string()
        .min(1, 'Medical record id is required')
        .safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}
