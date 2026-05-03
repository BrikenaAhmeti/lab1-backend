import { z } from 'zod';
import { AppError } from '../../../shared/core/errors/app-error';

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

const createDepartmentSchema = z.object({
    name: z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().trim().min(1, 'Name is required').max(100),
    ),
    location: z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().trim().min(1, 'Location is required').max(255),
    ),
    description: z.string().max(255).optional(),
});

const updateDepartmentSchema = createDepartmentSchema;

export type CreateDepartmentDto = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentDto = z.infer<typeof updateDepartmentSchema>;

export function validateCreateDepartmentDto(input: unknown): CreateDepartmentDto {
    const result = createDepartmentSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateUpdateDepartmentDto(input: unknown): UpdateDepartmentDto {
    const result = updateDepartmentSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateDepartmentId(input: unknown): string {
    const result = z.string().min(1, 'Department id is required').safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}
