import { z } from 'zod';
import {
    IsEmail,
    IsBoolean,
    IsDefined,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
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

const phoneNumberRegex = /^\+?[0-9]{7,15}$/;
const usernameRegex = /^[a-zA-Z0-9._-]+$/;
const doctorSortByValues = [
    'created_at',
    'first_name',
    'last_name',
    'specialization',
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

export class CreateDoctorDto {
    @OptionalField()
    @IsString({ message: 'User id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'User id is required' })
    @MaxLength(255, {
        message: 'User id must not exceed 255 characters',
    })
    userId?: string;

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

    @IsDefined({ message: 'Specialization is required' })
    @IsString({ message: 'Specialization is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Specialization is required' })
    @MaxLength(100, {
        message: 'Specialization must not exceed 100 characters',
    })
    specialization!: string;

    @IsDefined({ message: 'Department id is required' })
    @IsString({ message: 'Department id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Department id is required' })
    @MaxLength(255, {
        message: 'Department id must not exceed 255 characters',
    })
    departmentId!: string;

    @IsDefined({ message: 'Phone number is required' })
    @IsString({ message: 'Phone number is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(phoneNumberRegex, {
        message: 'phoneNumber format is invalid',
    })
    phoneNumber!: string;

    @OptionalField()
    @IsString({ message: 'Email must be a string' })
    @NormalizeString()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email?: string;

    @OptionalField()
    @IsString({ message: 'Username must be a string' })
    @NormalizeString()
    @MinLength(3, { message: 'Username must be at least 3 characters' })
    @MaxLength(30, { message: 'Username must not exceed 30 characters' })
    @Matches(usernameRegex, {
        message: 'Username can contain only letters, numbers, dots, underscores, and hyphens',
    })
    username?: string;

    @OptionalField()
    @IsString({ message: 'Password must be a string' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(255, { message: 'Password must not exceed 255 characters' })
    password?: string;
}

export class UpdateDoctorDto {
    @OptionalField()
    @IsString({ message: 'User id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'User id is required' })
    @MaxLength(255, {
        message: 'User id must not exceed 255 characters',
    })
    userId?: string;

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
    @IsString({ message: 'Specialization is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Specialization is required' })
    @MaxLength(100, {
        message: 'Specialization must not exceed 100 characters',
    })
    specialization?: string;

    @OptionalField()
    @IsString({ message: 'Department id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Department id is required' })
    @MaxLength(255, {
        message: 'Department id must not exceed 255 characters',
    })
    departmentId?: string;

    @OptionalField()
    @IsString({ message: 'Phone number is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(phoneNumberRegex, {
        message: 'phoneNumber format is invalid',
    })
    phoneNumber?: string;
}

export class SetDoctorStatusDto {
    @IsDefined({ message: 'isActive is required' })
    @IsBoolean({ message: 'isActive must be a boolean' })
    isActive!: boolean;
}

const getDoctorsQuerySchema = createPaginationQuerySchema(
    doctorSortByValues,
).extend({
    departmentId: z.preprocess(
        normalizeOptionalString,
        z.string().max(255).optional(),
    ),
    specialization: z.preprocess(
        normalizeOptionalString,
        z.string().max(100).optional(),
    ),
});

export type GetDoctorsQueryDto = z.infer<typeof getDoctorsQuerySchema>;

export function validateCreateDoctorDto(input: unknown): CreateDoctorDto {
    return validateDto(CreateDoctorDto, input);
}

export function validateUpdateDoctorDto(input: unknown): UpdateDoctorDto {
    const dto = validateDto(UpdateDoctorDto, input);

    assertAtLeastOneField(
        dto,
        [
            'userId',
            'firstName',
            'lastName',
            'specialization',
            'departmentId',
            'phoneNumber',
        ],
    );

    return dto;
}

export function validateGetDoctorsQueryDto(input: unknown): GetDoctorsQueryDto {
    const result = getDoctorsQuerySchema.safeParse(input);

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

export function validateSetDoctorStatusDto(input: unknown): SetDoctorStatusDto {
    return validateDto(SetDoctorStatusDto, input);
}
