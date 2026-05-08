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
    NormalizeNullableString,
    NormalizeString,
    OptionalField,
    OptionalNullableField,
} from '../../../shared/validation/decorators';
import {
    assertAtLeastOneField,
    validateDto,
} from '../../../shared/validation/validate-dto';

const medicalRecordDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const medicalRecordSortByValues = ['created_at', 'date'] as const;

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

function requiredString(fieldName: string, maxLength: number) {
    return z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().trim().min(1, `${fieldName} is required`).max(maxLength),
    );
}

function isValidMedicalRecordDate(value: string) {
    if (!medicalRecordDateRegex.test(value)) {
        return false;
    }

    return !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

function normalizeMedicalRecordInput(input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return input;
    }

    const value = input as Record<string, unknown>;

    return {
        patientId: value.patientId ?? value.patient_id,
        doctorId: value.doctorId ?? value.doctor_id,
        diagnosis: value.diagnosis ?? value.diagnoza,
        treatment: value.treatment ?? value.trajtimi,
        prescriptionsText:
            value.prescriptionsText
            ?? value.prescriptions_text
            ?? value.recetat,
        date: value.date ?? value.data,
    };
}

function normalizeMedicalRecordQuery(input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return input;
    }

    const value = input as Record<string, unknown>;

    return {
        ...value,
        patientId: value.patientId ?? value.patient_id,
    };
}

const medicalRecordDateSchema = z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : ''),
    z.string()
        .min(1, 'Date is required')
        .refine(isValidMedicalRecordDate, {
            message: 'Date must be in YYYY-MM-DD format',
        }),
);

const prescriptionsTextSchema = z.preprocess(
    (value) => {
        if (value === null) {
            return null;
        }

        if (typeof value === 'string') {
            return value;
        }

        return undefined;
    },
    z.union([z.string().trim().max(4000), z.null()]).optional(),
);

export class CreateMedicalRecordDto {
    static normalize(input: unknown) {
        return normalizeMedicalRecordInput(input);
    }

    @IsDefined({ message: 'Patient id is required' })
    @IsString({ message: 'Patient id is required' })
    @NormalizeString('patient_id')
    @IsNotEmpty({ message: 'Patient id is required' })
    @MaxLength(255, {
        message: 'Patient id must not exceed 255 characters',
    })
    patientId!: string;

    @IsDefined({ message: 'Doctor id is required' })
    @IsString({ message: 'Doctor id is required' })
    @NormalizeString('doctor_id')
    @IsNotEmpty({ message: 'Doctor id is required' })
    @MaxLength(255, {
        message: 'Doctor id must not exceed 255 characters',
    })
    doctorId!: string;

    @IsDefined({ message: 'Diagnosis is required' })
    @IsString({ message: 'Diagnosis is required' })
    @NormalizeString('diagnoza')
    @IsNotEmpty({ message: 'Diagnosis is required' })
    @MaxLength(2000, {
        message: 'Diagnosis must not exceed 2000 characters',
    })
    diagnosis!: string;

    @IsDefined({ message: 'Treatment is required' })
    @IsString({ message: 'Treatment is required' })
    @NormalizeString('trajtimi')
    @IsNotEmpty({ message: 'Treatment is required' })
    @MaxLength(4000, {
        message: 'Treatment must not exceed 4000 characters',
    })
    treatment!: string;

    @OptionalNullableField()
    @IsString({ message: 'Prescriptions text must be a string' })
    @NormalizeNullableString('prescriptions_text', 'recetat')
    @MaxLength(4000, {
        message: 'Prescriptions text must not exceed 4000 characters',
    })
    prescriptionsText?: string | null;

    @IsDefined({ message: 'Date is required' })
    @IsString({ message: 'Date is required' })
    @NormalizeString('data')
    @IsNotEmpty({ message: 'Date is required' })
    @IsDateOnlyString({
        message: 'Date must be in YYYY-MM-DD format',
    })
    date!: string;
}

export class UpdateMedicalRecordDto {
    static normalize(input: unknown) {
        return normalizeMedicalRecordInput(input);
    }

    @OptionalField()
    @IsString({ message: 'Patient id is required' })
    @NormalizeString('patient_id')
    @IsNotEmpty({ message: 'Patient id is required' })
    @MaxLength(255, {
        message: 'Patient id must not exceed 255 characters',
    })
    patientId?: string;

    @OptionalField()
    @IsString({ message: 'Doctor id is required' })
    @NormalizeString('doctor_id')
    @IsNotEmpty({ message: 'Doctor id is required' })
    @MaxLength(255, {
        message: 'Doctor id must not exceed 255 characters',
    })
    doctorId?: string;

    @OptionalField()
    @IsString({ message: 'Diagnosis is required' })
    @NormalizeString('diagnoza')
    @IsNotEmpty({ message: 'Diagnosis is required' })
    @MaxLength(2000, {
        message: 'Diagnosis must not exceed 2000 characters',
    })
    diagnosis?: string;

    @OptionalField()
    @IsString({ message: 'Treatment is required' })
    @NormalizeString('trajtimi')
    @IsNotEmpty({ message: 'Treatment is required' })
    @MaxLength(4000, {
        message: 'Treatment must not exceed 4000 characters',
    })
    treatment?: string;

    @OptionalNullableField()
    @IsString({ message: 'Prescriptions text must be a string' })
    @NormalizeNullableString('prescriptions_text', 'recetat')
    @MaxLength(4000, {
        message: 'Prescriptions text must not exceed 4000 characters',
    })
    prescriptionsText?: string | null;

    @OptionalField()
    @IsString({ message: 'Date is required' })
    @NormalizeString('data')
    @IsNotEmpty({ message: 'Date is required' })
    @IsDateOnlyString({
        message: 'Date must be in YYYY-MM-DD format',
    })
    date?: string;
}

const getMedicalRecordsQuerySchema = z.preprocess(
    normalizeMedicalRecordQuery,
    createPaginationQuerySchema(medicalRecordSortByValues).extend({
        patientId: requiredString('Patient id', 255),
    }),
);

export type GetMedicalRecordsQueryDto = z.infer<
    typeof getMedicalRecordsQuerySchema
>;

export function validateCreateMedicalRecordDto(
    input: unknown,
): CreateMedicalRecordDto {
    return validateDto(CreateMedicalRecordDto, input);
}

export function validateUpdateMedicalRecordDto(
    input: unknown,
): UpdateMedicalRecordDto {
    const dto = validateDto(UpdateMedicalRecordDto, input);

    assertAtLeastOneField(
        dto,
        [
            'patientId',
            'doctorId',
            'diagnosis',
            'treatment',
            'prescriptionsText',
            'date',
        ],
    );

    return dto;
}

export function validateGetMedicalRecordsQueryDto(
    input: unknown,
): GetMedicalRecordsQueryDto {
    const result = getMedicalRecordsQuerySchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateMedicalRecordId(input: unknown): string {
    const result = z
        .string()
        .min(1, 'Medical record id is required')
        .safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}
