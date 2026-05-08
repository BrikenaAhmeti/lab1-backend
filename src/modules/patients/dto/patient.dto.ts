import { z } from 'zod';
import {
    IsDefined,
    IsIn,
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
    IsDateOnlyString,
    NormalizeString,
    NormalizeUppercaseString,
    OptionalField,
} from '../../../shared/validation/decorators';
import {
    assertAtLeastOneField,
    validateDto,
} from '../../../shared/validation/validate-dto';

const phoneNumberRegex = /^\+?[0-9]{7,15}$/;
const dateOfBirthRegex = /^\d{4}-\d{2}-\d{2}$/;
const genderValues = ['MALE', 'FEMALE', 'OTHER'] as const;
const bloodTypeValues = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const patientSortByValues = [
    'created_at',
    'first_name',
    'last_name',
    'date_of_birth',
] as const;

function isValidDateOfBirth(value: string) {
    if (!dateOfBirthRegex.test(value)) {
        return false;
    }

    return !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

export class CreatePatientDto {
    @IsDefined({ message: 'First name is required' })
    @IsString({ message: 'First name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(2, {
        message: 'First name must be at least 2 characters',
    })
    @MaxLength(100, {
        message: 'First name must not exceed 100 characters',
    })
    firstName!: string;

    @IsDefined({ message: 'Last name is required' })
    @IsString({ message: 'Last name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MinLength(2, {
        message: 'Last name must be at least 2 characters',
    })
    @MaxLength(100, {
        message: 'Last name must not exceed 100 characters',
    })
    lastName!: string;

    @IsDefined({ message: 'Date of birth is required' })
    @IsString({ message: 'Date of birth is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Date of birth is required' })
    @IsDateOnlyString({
        message: 'dateOfBirth must be in YYYY-MM-DD format',
    })
    dateOfBirth!: string;

    @IsDefined({ message: 'Gender is required' })
    @IsString({ message: 'Gender is required' })
    @NormalizeUppercaseString()
    @IsNotEmpty({ message: 'Gender is required' })
    @IsIn(genderValues, {
        message: 'Gender must be MALE, FEMALE, or OTHER',
    })
    gender!: (typeof genderValues)[number];

    @IsDefined({ message: 'Phone number is required' })
    @IsString({ message: 'Phone number is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(phoneNumberRegex, {
        message: 'phoneNumber format is invalid',
    })
    phoneNumber!: string;

    @IsDefined({ message: 'Address is required' })
    @IsString({ message: 'Address is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Address is required' })
    @MinLength(2, {
        message: 'Address must be at least 2 characters',
    })
    @MaxLength(255, {
        message: 'Address must not exceed 255 characters',
    })
    address!: string;

    @IsDefined({ message: 'Blood type is required' })
    @IsString({ message: 'Blood type is required' })
    @NormalizeUppercaseString()
    @IsNotEmpty({ message: 'Blood type is required' })
    @IsIn(bloodTypeValues, {
        message: 'Blood type must be one of A+, A-, B+, B-, AB+, AB-, O+, O-',
    })
    bloodType!: (typeof bloodTypeValues)[number];
}

export class UpdatePatientDto {
    @OptionalField()
    @IsString({ message: 'First name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(2, {
        message: 'First name must be at least 2 characters',
    })
    @MaxLength(100, {
        message: 'First name must not exceed 100 characters',
    })
    firstName?: string;

    @OptionalField()
    @IsString({ message: 'Last name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MinLength(2, {
        message: 'Last name must be at least 2 characters',
    })
    @MaxLength(100, {
        message: 'Last name must not exceed 100 characters',
    })
    lastName?: string;

    @OptionalField()
    @IsString({ message: 'Date of birth is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Date of birth is required' })
    @IsDateOnlyString({
        message: 'dateOfBirth must be in YYYY-MM-DD format',
    })
    dateOfBirth?: string;

    @OptionalField()
    @IsString({ message: 'Gender is required' })
    @NormalizeUppercaseString()
    @IsNotEmpty({ message: 'Gender is required' })
    @IsIn(genderValues, {
        message: 'Gender must be MALE, FEMALE, or OTHER',
    })
    gender?: (typeof genderValues)[number];

    @OptionalField()
    @IsString({ message: 'Phone number is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(phoneNumberRegex, {
        message: 'phoneNumber format is invalid',
    })
    phoneNumber?: string;

    @OptionalField()
    @IsString({ message: 'Address is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Address is required' })
    @MinLength(2, {
        message: 'Address must be at least 2 characters',
    })
    @MaxLength(255, {
        message: 'Address must not exceed 255 characters',
    })
    address?: string;

    @OptionalField()
    @IsString({ message: 'Blood type is required' })
    @NormalizeUppercaseString()
    @IsNotEmpty({ message: 'Blood type is required' })
    @IsIn(bloodTypeValues, {
        message: 'Blood type must be one of A+, A-, B+, B-, AB+, AB-, O+, O-',
    })
    bloodType?: (typeof bloodTypeValues)[number];
}

const getPatientsQuerySchema = createPaginationQuerySchema(
    patientSortByValues,
).extend({
    search: z.preprocess(
        normalizeOptionalString,
        z.string().max(100).optional(),
    ),
    bloodGroup: z.preprocess(
        (value) => {
            if (typeof value !== 'string') {
                return undefined;
            }

            const normalizedValue = value.trim().toUpperCase();

            return normalizedValue.length > 0 ? normalizedValue : undefined;
        },
        z.enum(bloodTypeValues).optional(),
    ),
    gender: z.preprocess(
        (value) => {
            if (typeof value !== 'string') {
                return undefined;
            }

            const normalizedValue = value.trim().toUpperCase();

            return normalizedValue.length > 0 ? normalizedValue : undefined;
        },
        z.enum(genderValues).optional(),
    ),
});

export type GetPatientsQueryDto = z.infer<typeof getPatientsQuerySchema>;

export function validateCreatePatientDto(input: unknown): CreatePatientDto {
    return validateDto(CreatePatientDto, input);
}

export function validateUpdatePatientDto(input: unknown): UpdatePatientDto {
    const dto = validateDto(UpdatePatientDto, input);

    assertAtLeastOneField(
        dto,
        [
            'firstName',
            'lastName',
            'dateOfBirth',
            'gender',
            'phoneNumber',
            'address',
            'bloodType',
        ],
    );

    return dto;
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
