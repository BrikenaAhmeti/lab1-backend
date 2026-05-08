import { z } from 'zod';
import { AppError } from '../../../shared/core/errors/app-error';
import {
    createPaginationQuerySchema,
    normalizeOptionalString,
} from '../../../shared/core/pagination';
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

const createRoomSchema = z.object({
    roomNumber: requiredString('Room number', 50),
    departmentId: requiredString('Department id', 255),
    type: roomTypeSchema,
    status: roomStatusSchema.optional(),
    capacity: capacitySchema,
});

const updateRoomSchema = createRoomSchema.partial().refine(
    (value) => Object.values(value).some((item) => item !== undefined),
    {
        message: 'At least one field is required',
    },
);

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

export type CreateRoomDto = z.infer<typeof createRoomSchema>;
export type UpdateRoomDto = z.infer<typeof updateRoomSchema>;
export type GetRoomsQueryDto = z.infer<typeof getRoomsQuerySchema>;

export function validateCreateRoomDto(input: unknown): CreateRoomDto {
    const result = createRoomSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
}

export function validateUpdateRoomDto(input: unknown): UpdateRoomDto {
    const result = updateRoomSchema.safeParse(input);

    if (!result.success) {
        throw new AppError(getValidationMessage(result.error), 400);
    }

    return result.data;
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
