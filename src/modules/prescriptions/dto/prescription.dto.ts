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
    NormalizeNullableString,
    NormalizeString,
    OptionalField,
    OptionalNullableField,
} from '../../../shared/validation/decorators';
import {
    assertAtLeastOneField,
    validateDto,
} from '../../../shared/validation/validate-dto';

const prescriptionSortByValues = ['created_at', 'medicine'] as const;

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

function requiredString(fieldName: string, maxLength: number) {
    return z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().trim().min(1, `${fieldName} is required`).max(maxLength),
    );
}

function normalizePrescriptionInput(input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return input;
    }

    const value = input as Record<string, unknown>;

    return {
        medicalRecordId: value.medicalRecordId ?? value.medical_record_id,
        medicine: value.medicine ?? value.bari,
        dosage: value.dosage ?? value.dozimi,
        duration: value.duration ?? value.kohezgjatja,
        instructions: value.instructions ?? value.udhezime,
    };
}

function normalizePrescriptionQuery(input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return input;
    }

    const value = input as Record<string, unknown>;

    return {
        ...value,
        medicalRecordId: value.medicalRecordId ?? value.medical_record_id,
    };
}

const instructionsSchema = z.preprocess(
    (value) => {
        if (value === null) {
            return null;
        }

        if (typeof value === 'string') {
            return value;
        }

        return undefined;
    },
    z.union([z.string().trim().max(2000), z.null()]).optional(),
);

export class CreatePrescriptionDto {
    static normalize(input: unknown) {
        return normalizePrescriptionInput(input);
    }

    @IsDefined({ message: 'Medical record id is required' })
    @IsString({ message: 'Medical record id is required' })
    @NormalizeString('medical_record_id')
    @IsNotEmpty({ message: 'Medical record id is required' })
    @MaxLength(255, {
        message: 'Medical record id must not exceed 255 characters',
    })
    medicalRecordId!: string;

    @IsDefined({ message: 'Medicine is required' })
    @IsString({ message: 'Medicine is required' })
    @NormalizeString('bari')
    @IsNotEmpty({ message: 'Medicine is required' })
    @MaxLength(255, {
        message: 'Medicine must not exceed 255 characters',
    })
    medicine!: string;

    @IsDefined({ message: 'Dosage is required' })
    @IsString({ message: 'Dosage is required' })
    @NormalizeString('dozimi')
    @IsNotEmpty({ message: 'Dosage is required' })
    @MaxLength(255, {
        message: 'Dosage must not exceed 255 characters',
    })
    dosage!: string;

    @IsDefined({ message: 'Duration is required' })
    @IsString({ message: 'Duration is required' })
    @NormalizeString('kohezgjatja')
    @IsNotEmpty({ message: 'Duration is required' })
    @MaxLength(255, {
        message: 'Duration must not exceed 255 characters',
    })
    duration!: string;

    @OptionalNullableField()
    @IsString({ message: 'Instructions must be a string' })
    @NormalizeNullableString('udhezime')
    @MaxLength(2000, {
        message: 'Instructions must not exceed 2000 characters',
    })
    instructions?: string | null;
}

export class UpdatePrescriptionDto {
    static normalize(input: unknown) {
        return normalizePrescriptionInput(input);
    }

    @OptionalField()
    @IsString({ message: 'Medical record id is required' })
    @NormalizeString('medical_record_id')
    @IsNotEmpty({ message: 'Medical record id is required' })
    @MaxLength(255, {
        message: 'Medical record id must not exceed 255 characters',
    })
    medicalRecordId?: string;

    @OptionalField()
    @IsString({ message: 'Medicine is required' })
    @NormalizeString('bari')
    @IsNotEmpty({ message: 'Medicine is required' })
    @MaxLength(255, {
        message: 'Medicine must not exceed 255 characters',
    })
    medicine?: string;

    @OptionalField()
    @IsString({ message: 'Dosage is required' })
    @NormalizeString('dozimi')
    @IsNotEmpty({ message: 'Dosage is required' })
    @MaxLength(255, {
        message: 'Dosage must not exceed 255 characters',
    })
    dosage?: string;

    @OptionalField()
    @IsString({ message: 'Duration is required' })
    @NormalizeString('kohezgjatja')
    @IsNotEmpty({ message: 'Duration is required' })
    @MaxLength(255, {
        message: 'Duration must not exceed 255 characters',
    })
    duration?: string;

    @OptionalNullableField()
    @IsString({ message: 'Instructions must be a string' })
    @NormalizeNullableString('udhezime')
    @MaxLength(2000, {
        message: 'Instructions must not exceed 2000 characters',
    })
    instructions?: string | null;
}

const getPrescriptionsQuerySchema = z.preprocess(
    normalizePrescriptionQuery,
    createPaginationQuerySchema(prescriptionSortByValues).extend({
        medicalRecordId: requiredString('Medical record id', 255),
    }),
);

export type GetPrescriptionsQueryDto = z.infer<
    typeof getPrescriptionsQuerySchema
>;

export function validateCreatePrescriptionDto(
    input: unknown,
): CreatePrescriptionDto {
    return validateDto(CreatePrescriptionDto, input);
}

export function validateUpdatePrescriptionDto(
    input: unknown,
): UpdatePrescriptionDto {
    const dto = validateDto(UpdatePrescriptionDto, input);

    assertAtLeastOneField(
        dto,
        [
            'medicalRecordId',
            'medicine',
            'dosage',
            'duration',
            'instructions',
        ],
    );

    return dto;
}

export function validateGetPrescriptionsQueryDto(
    input: unknown,
): GetPrescriptionsQueryDto {
    const result = getPrescriptionsQuerySchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validatePrescriptionId(input: unknown): string {
    const result = z
        .string()
        .min(1, 'Prescription id is required')
        .safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}
