import { z } from 'zod';
import { AppError } from '../../../shared/core/errors/app-error';

const phoneNumberRegex = /^\+?[0-9]{7,15}$/;

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

function requiredString(fieldName: string, maxLength: number) {
    return z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().trim().min(1, `${fieldName} is required`).max(maxLength),
    );
}

function phoneNumberSchema() {
    return z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().trim().min(1, 'Phone number is required').regex(
            phoneNumberRegex,
            {
                message: 'phoneNumber format is invalid',
            },
        ),
    );
}

const createDoctorSchema = z.object({
    userId: requiredString('User id', 255),
    firstName: requiredString('First name', 100),
    lastName: requiredString('Last name', 100),
    specialization: requiredString('Specialization', 100),
    departmentId: requiredString('Department id', 255),
    phoneNumber: phoneNumberSchema(),
});

const updateDoctorSchema = createDoctorSchema.partial().refine(
    (value) => Object.values(value).some((item) => item !== undefined),
    {
        message: 'At least one field is required',
    },
);

export type CreateDoctorDto = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorDto = z.infer<typeof updateDoctorSchema>;

export function validateCreateDoctorDto(input: unknown): CreateDoctorDto {
    const result = createDoctorSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateUpdateDoctorDto(input: unknown): UpdateDoctorDto {
    const result = updateDoctorSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateDoctorId(input: unknown): string {
    const result = z.string().min(1, 'Doctor id is required').safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}
