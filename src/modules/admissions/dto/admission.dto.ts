import { z } from 'zod';
import {
    IsDefined,
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
    IsDateOnlyString,
    NormalizeString,
    OptionalField,
} from '../../../shared/validation/decorators';
import { validateDto } from '../../../shared/validation/validate-dto';
import { AdmissionStatus } from '../domain/admission.entity';

const admissionStatusValues = ['ACTIVE', 'DISCHARGED'] as const;
const admissionSortByValues = [
    'created_at',
    'admission_date',
    'discharge_date',
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

function optionalDateString(fieldName: string) {
    return z.preprocess(
        (value) => (typeof value === 'string' ? value.trim() : undefined),
        z.string()
            .min(1, `${fieldName} is required`)
            .refine((value) => !Number.isNaN(new Date(value).getTime()), {
                message: `${fieldName} is invalid`,
            })
            .optional(),
    );
}

const admissionStatusSchema = z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toUpperCase() : ''),
    z.string()
        .min(1, 'Status is required')
        .refine(
            (value): value is AdmissionStatus =>
                admissionStatusValues.includes(
                    value as (typeof admissionStatusValues)[number],
                ),
            {
                message: 'Status must be ACTIVE or DISCHARGED',
            },
        )
        .transform((value) => value as AdmissionStatus),
);

export class CreateAdmissionDto {
    @IsDefined({ message: 'Patient id is required' })
    @IsString({ message: 'Patient id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Patient id is required' })
    @MaxLength(255, {
        message: 'Patient id must not exceed 255 characters',
    })
    patientId!: string;

    @IsDefined({ message: 'Room id is required' })
    @IsString({ message: 'Room id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Room id is required' })
    @MaxLength(255, {
        message: 'Room id must not exceed 255 characters',
    })
    roomId!: string;

    @OptionalField()
    @IsString({ message: 'Admission date is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Admission date is required' })
    @IsDateOnlyString({
        message: 'Admission date is invalid',
    })
    admissionDate?: string;
}

export class DischargeAdmissionDto {
    @OptionalField()
    @IsString({ message: 'Discharge date is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Discharge date is required' })
    @IsDateOnlyString({
        message: 'Discharge date is invalid',
    })
    dischargeDate?: string;
}

const getAdmissionsQuerySchema = createPaginationQuerySchema(
    admissionSortByValues,
).extend({
    status: z.preprocess(
        normalizeOptionalString,
        admissionStatusSchema.optional(),
    ),
    patientId: z.preprocess(
        normalizeOptionalString,
        z.string().max(255).optional(),
    ),
    roomId: z.preprocess(
        normalizeOptionalString,
        z.string().max(255).optional(),
    ),
});

export type GetAdmissionsQueryDto = z.infer<typeof getAdmissionsQuerySchema>;

export function validateCreateAdmissionDto(input: unknown): CreateAdmissionDto {
    return validateDto(CreateAdmissionDto, input);
}

export function validateDischargeAdmissionDto(
    input: unknown,
): DischargeAdmissionDto {
    return validateDto(DischargeAdmissionDto, input);
}

export function validateGetAdmissionsQueryDto(
    input: unknown,
): GetAdmissionsQueryDto {
    const result = getAdmissionsQuerySchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateAdmissionId(input: unknown): string {
    const result = z.string().min(1, 'Admission id is required').safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}
