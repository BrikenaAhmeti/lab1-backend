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
    NormalizeString,
    OptionalField,
} from '../../../shared/validation/decorators';
import {
    assertAtLeastOneField,
    validateDto,
} from '../../../shared/validation/validate-dto';

const nurseShiftValues = ['Morning', 'Evening', 'Night'] as const;
const nurseSortByValues = [
    'created_at',
    'first_name',
    'last_name',
    'shift',
] as const;

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

export class CreateNurseDto {
    @IsDefined({ message: 'First name is required' })
    @IsString({ message: 'First name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'First name is required' })
    @MaxLength(100, {
        message: 'First name must not exceed 100 characters',
    })
    firstName!: string;

    @IsDefined({ message: 'Last name is required' })
    @IsString({ message: 'Last name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MaxLength(100, {
        message: 'Last name must not exceed 100 characters',
    })
    lastName!: string;

    @IsDefined({ message: 'Department id is required' })
    @IsString({ message: 'Department id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Department id is required' })
    @MaxLength(255, {
        message: 'Department id must not exceed 255 characters',
    })
    departmentId!: string;

    @IsDefined({ message: 'Shift is required' })
    @IsString({ message: 'Shift is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Shift is required' })
    @IsIn(nurseShiftValues, {
        message: 'Shift must be Morning, Evening, or Night',
    })
    shift!: (typeof nurseShiftValues)[number];
}

export class UpdateNurseDto {
    @OptionalField()
    @IsString({ message: 'First name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'First name is required' })
    @MaxLength(100, {
        message: 'First name must not exceed 100 characters',
    })
    firstName?: string;

    @OptionalField()
    @IsString({ message: 'Last name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MaxLength(100, {
        message: 'Last name must not exceed 100 characters',
    })
    lastName?: string;

    @OptionalField()
    @IsString({ message: 'Department id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Department id is required' })
    @MaxLength(255, {
        message: 'Department id must not exceed 255 characters',
    })
    departmentId?: string;

    @OptionalField()
    @IsString({ message: 'Shift is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Shift is required' })
    @IsIn(nurseShiftValues, {
        message: 'Shift must be Morning, Evening, or Night',
    })
    shift?: (typeof nurseShiftValues)[number];
}

const getNursesQuerySchema = createPaginationQuerySchema(
    nurseSortByValues,
).extend({
    departmentId: z.preprocess(
        normalizeOptionalString,
        z.string().max(255).optional(),
    ),
});

export type GetNursesQueryDto = z.infer<typeof getNursesQuerySchema>;

export function validateCreateNurseDto(input: unknown): CreateNurseDto {
    return validateDto(CreateNurseDto, input);
}

export function validateUpdateNurseDto(input: unknown): UpdateNurseDto {
    const dto = validateDto(UpdateNurseDto, input);

    assertAtLeastOneField(
        dto,
        ['firstName', 'lastName', 'departmentId', 'shift'],
    );

    return dto;
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
