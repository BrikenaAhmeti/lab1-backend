import { z } from 'zod';
import {
    IsDefined,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';
import { AppError } from '../../../shared/core/errors/app-error';
import {
    createPaginationQuerySchema,
    normalizeOptionalString,
} from '../../../shared/core/pagination';
import {
    NormalizeNumber,
    NormalizeString,
    NormalizeUppercaseString,
    OptionalField,
} from '../../../shared/validation/decorators';
import {
    assertAtLeastOneField,
    validateDto,
} from '../../../shared/validation/validate-dto';
import { RoomStatus, RoomType } from '../domain/room.entity';

const roomTypeValues = [
    'GENERAL',
    'ICU',
    'SURGERY',
    'EMERGENCY',
    'PEDIATRIC',
] as const;

const roomStatusValues = [
    'AVAILABLE',
    'OCCUPIED',
    'UNDER_MAINTENANCE',
] as const;
const roomSortByValues = ['created_at', 'room_number', 'capacity'] as const;

function getValidationMessage(error: z.ZodError) {
    return error.issues[0]?.message ?? 'Validation failed';
}

function requiredString(fieldName: string, maxLength: number) {
    return z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().trim().min(1, `${fieldName} is required`).max(maxLength),
    );
}

const roomTypeSchema = z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toUpperCase() : ''),
    z.string()
        .min(1, 'Type is required')
        .refine(
            (value): value is RoomType =>
                roomTypeValues.includes(value as (typeof roomTypeValues)[number]),
            {
                message: 'Type must be GENERAL, ICU, SURGERY, EMERGENCY, or PEDIATRIC',
            },
        )
        .transform((value) => value as RoomType),
);

const roomStatusSchema = z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toUpperCase() : ''),
    z.string()
        .min(1, 'Status is required')
        .refine(
            (value): value is RoomStatus =>
                roomStatusValues.includes(value as (typeof roomStatusValues)[number]),
            {
                message: 'Status must be AVAILABLE, OCCUPIED, or UNDER_MAINTENANCE',
            },
        )
        .transform((value) => value as RoomStatus),
);

const capacitySchema = z.preprocess(
    (value) => {
        if (typeof value === 'string') {
            const trimmedValue = value.trim();

            if (trimmedValue.length === 0) {
                return value;
            }

            return Number(trimmedValue);
        }

        return value;
    },
    z.number().int().min(1, 'Capacity must be greater than 0'),
);

export class CreateRoomDto {
    @IsDefined({ message: 'Room number is required' })
    @IsString({ message: 'Room number is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Room number is required' })
    @MaxLength(50, {
        message: 'Room number must not exceed 50 characters',
    })
    roomNumber!: string;

    @IsDefined({ message: 'Department id is required' })
    @IsString({ message: 'Department id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Department id is required' })
    @MaxLength(255, {
        message: 'Department id must not exceed 255 characters',
    })
    departmentId!: string;

    @IsDefined({ message: 'Type is required' })
    @IsString({ message: 'Type is required' })
    @NormalizeUppercaseString()
    @IsNotEmpty({ message: 'Type is required' })
    @IsIn(roomTypeValues, {
        message: 'Type must be GENERAL, ICU, SURGERY, EMERGENCY, or PEDIATRIC',
    })
    type!: RoomType;

    @OptionalField()
    @IsString({ message: 'Status is required' })
    @NormalizeUppercaseString()
    @IsNotEmpty({ message: 'Status is required' })
    @IsIn(roomStatusValues, {
        message: 'Status must be AVAILABLE, OCCUPIED, or UNDER_MAINTENANCE',
    })
    status?: RoomStatus;

    @IsDefined({ message: 'Capacity is required' })
    @NormalizeNumber()
    @IsInt({ message: 'Capacity must be a whole number' })
    @Min(1, { message: 'Capacity must be greater than 0' })
    capacity!: number;
}

export class UpdateRoomDto {
    @OptionalField()
    @IsString({ message: 'Room number is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Room number is required' })
    @MaxLength(50, {
        message: 'Room number must not exceed 50 characters',
    })
    roomNumber?: string;

    @OptionalField()
    @IsString({ message: 'Department id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Department id is required' })
    @MaxLength(255, {
        message: 'Department id must not exceed 255 characters',
    })
    departmentId?: string;

    @OptionalField()
    @IsString({ message: 'Type is required' })
    @NormalizeUppercaseString()
    @IsNotEmpty({ message: 'Type is required' })
    @IsIn(roomTypeValues, {
        message: 'Type must be GENERAL, ICU, SURGERY, EMERGENCY, or PEDIATRIC',
    })
    type?: RoomType;

    @OptionalField()
    @IsString({ message: 'Status is required' })
    @NormalizeUppercaseString()
    @IsNotEmpty({ message: 'Status is required' })
    @IsIn(roomStatusValues, {
        message: 'Status must be AVAILABLE, OCCUPIED, or UNDER_MAINTENANCE',
    })
    status?: RoomStatus;

    @OptionalField()
    @NormalizeNumber()
    @IsInt({ message: 'Capacity must be a whole number' })
    @Min(1, { message: 'Capacity must be greater than 0' })
    capacity?: number;
}

const getRoomsQuerySchema = createPaginationQuerySchema(roomSortByValues).extend({
    departmentId: z.preprocess(
        normalizeOptionalString,
        z.string().max(255).optional(),
    ),
    type: z.preprocess(
        normalizeOptionalString,
        roomTypeSchema.optional(),
    ),
});

export type GetRoomsQueryDto = z.infer<typeof getRoomsQuerySchema>;

export function validateCreateRoomDto(input: unknown): CreateRoomDto {
    return validateDto(CreateRoomDto, input);
}

export function validateUpdateRoomDto(input: unknown): UpdateRoomDto {
    const dto = validateDto(UpdateRoomDto, input);

    assertAtLeastOneField(
        dto,
        ['roomNumber', 'departmentId', 'type', 'status', 'capacity'],
    );

    return dto;
}

export function validateGetRoomsQueryDto(input: unknown): GetRoomsQueryDto {
    const result = getRoomsQuerySchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateRoomId(input: unknown): string {
    const result = z.string().min(1, 'Room id is required').safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}
