import { z } from 'zod';
import {
    IsDefined,
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';
import { AppError } from '../../../shared/core/errors/app-error';
import { createPaginationQuerySchema } from '../../../shared/core/pagination';
import {
    NormalizeString,
    OptionalField,
} from '../../../shared/validation/decorators';
import {
    assertAtLeastOneField,
    validateDto,
} from '../../../shared/validation/validate-dto';

const departmentSortByValues = ['created_at', 'name', 'location'] as const;

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

export class CreateDepartmentDto {
    @IsDefined({ message: 'Name is required' })
    @IsString({ message: 'Name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Name is required' })
    @MaxLength(100, {
        message: 'Name must not exceed 100 characters',
    })
    name!: string;

    @IsDefined({ message: 'Location is required' })
    @IsString({ message: 'Location is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Location is required' })
    @MaxLength(255, {
        message: 'Location must not exceed 255 characters',
    })
    location!: string;

    @OptionalField()
    @IsString({ message: 'Description must be a string' })
    @NormalizeString()
    @MaxLength(255, {
        message: 'Description must not exceed 255 characters',
    })
    description?: string;
}

export class UpdateDepartmentDto {
    @OptionalField()
    @IsString({ message: 'Name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Name is required' })
    @MaxLength(100, {
        message: 'Name must not exceed 100 characters',
    })
    name?: string;

    @OptionalField()
    @IsString({ message: 'Location is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Location is required' })
    @MaxLength(255, {
        message: 'Location must not exceed 255 characters',
    })
    location?: string;

    @OptionalField()
    @IsString({ message: 'Description must be a string' })
    @NormalizeString()
    @MaxLength(255, {
        message: 'Description must not exceed 255 characters',
    })
    description?: string;
}
const getDepartmentsQuerySchema = createPaginationQuerySchema(
    departmentSortByValues,
);

export type GetDepartmentsQueryDto = z.infer<typeof getDepartmentsQuerySchema>;

export function validateCreateDepartmentDto(input: unknown): CreateDepartmentDto {
    return validateDto(CreateDepartmentDto, input);
}

export function validateUpdateDepartmentDto(input: unknown): UpdateDepartmentDto {
    const dto = validateDto(UpdateDepartmentDto, input);

    assertAtLeastOneField(dto, ['name', 'location', 'description']);

    return dto;
}

export function validateGetDepartmentsQueryDto(
    input: unknown,
): GetDepartmentsQueryDto {
    const result = getDepartmentsQuerySchema.safeParse(input);

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
