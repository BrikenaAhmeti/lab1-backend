import { z } from 'zod';
import { AppError } from '../../../shared/core/errors/app-error';

const phoneNumberRegex = /^\+?[0-9]{7,15}$/;
const dateOfBirthRegex = /^\d{4}-\d{2}-\d{2}$/;
const genderValues = ['MALE', 'FEMALE', 'OTHER'] as const;
const bloodTypeValues = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

function isValidDateOfBirth(value: string) {
    if (!dateOfBirthRegex.test(value)) {
        return false;
    }

    return !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

const createPatientSchema = z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    dateOfBirth: z.string().refine(isValidDateOfBirth, {
        message: 'dateOfBirth must be in YYYY-MM-DD format',
    }),
    gender: z.enum(genderValues),
    phoneNumber: z.string().regex(phoneNumberRegex, {
        message: 'phoneNumber format is invalid',
    }),
    address: z.string().min(2).max(255),
    bloodType: z.enum(bloodTypeValues),
});

const updatePatientSchema = createPatientSchema.partial().refine(
    (value) => Object.values(value).some((item) => item !== undefined),
    {
        message: 'At least one field is required',
    },
);

const getPatientsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.preprocess(
        (value) => {
            if (typeof value === 'string' && value.trim() === '') {
                return undefined;
            }

            return value;
        },
        z.string().min(1).max(100).optional(),
    ),
});

export type CreatePatientDto = z.infer<typeof createPatientSchema>;
export type UpdatePatientDto = z.infer<typeof updatePatientSchema>;
export type GetPatientsQueryDto = z.infer<typeof getPatientsQuerySchema>;

export function validateCreatePatientDto(input: unknown): CreatePatientDto {
    const result = createPatientSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateUpdatePatientDto(input: unknown): UpdatePatientDto {
    const result = updatePatientSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateGetPatientsQueryDto(
    input: unknown,
): GetPatientsQueryDto {
    const result = getPatientsQuerySchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validatePatientId(input: unknown): string {
    const result = z.string().min(1, 'Patient id is required').safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}
