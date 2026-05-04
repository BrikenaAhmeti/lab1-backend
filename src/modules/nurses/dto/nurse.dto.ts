import { z } from 'zod';
import { AppError } from '../../../shared/core/errors/app-error';

const nurseShiftValues = ['Morning', 'Evening', 'Night'] as const;

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

function requiredString(fieldName: string, maxLength: number) {
    return z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().trim().min(1, `${fieldName} is required`).max(maxLength),
    );
}

const nurseShiftSchema = z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : ''),
    z.string()
        .min(1, 'Shift is required')
        .refine(
            (value): value is (typeof nurseShiftValues)[number] =>
                nurseShiftValues.includes(
                    value as (typeof nurseShiftValues)[number],
                ),
            {
                message: 'Shift must be Morning, Evening, or Night',
            },
        )
        .transform((value) => value as (typeof nurseShiftValues)[number]),
);

const createNurseSchema = z.object({
    firstName: requiredString('First name', 100),
    lastName: requiredString('Last name', 100),
    departmentId: requiredString('Department id', 255),
    shift: nurseShiftSchema,
});

const updateNurseSchema = createNurseSchema.partial().refine(
    (value) => Object.values(value).some((item) => item !== undefined),
    {
        message: 'At least one field is required',
    },
);

const getNursesQuerySchema = z.object({
    departmentId: z.preprocess(
        (value) => (typeof value === 'string' ? value : undefined),
        z.string().trim().min(1, 'Department id is required').max(255).optional(),
    ),
});

export type CreateNurseDto = z.infer<typeof createNurseSchema>;
export type UpdateNurseDto = z.infer<typeof updateNurseSchema>;
export type GetNursesQueryDto = z.infer<typeof getNursesQuerySchema>;

export function validateCreateNurseDto(input: unknown): CreateNurseDto {
    const result = createNurseSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateUpdateNurseDto(input: unknown): UpdateNurseDto {
    const result = updateNurseSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateGetNursesQueryDto(input: unknown): GetNursesQueryDto {
    const result = getNursesQuerySchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateNurseId(input: unknown): string {
    const result = z.string().min(1, 'Nurse id is required').safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}
