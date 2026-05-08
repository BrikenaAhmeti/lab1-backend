import { z } from 'zod';

const sortOrderValues = ['ASC', 'DESC'] as const;

type SortableValue = string | number | Date | null | undefined;

export type SortOrder = (typeof sortOrderValues)[number];

export interface PaginationQueryParams<TSortBy extends string = string> {
    page: number;
    limit: number;
    sortBy: TSortBy;
    order: SortOrder;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export function normalizeOptionalString(value: unknown) {
    if (typeof value !== 'string') {
        return undefined;
    }

    const normalizedValue = value.trim();

    return normalizedValue.length > 0 ? normalizedValue : undefined;
}

export function createPaginationQuerySchema<
    TSortBy extends readonly [string, ...string[]],
>(sortByValues: TSortBy) {
    return z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        sortBy: z.preprocess(
            (value) => {
                if (typeof value !== 'string') {
                    return undefined;
                }

                const normalizedValue = value.trim().toLowerCase();

                return normalizedValue.length > 0 ? normalizedValue : undefined;
            },
            z.enum(sortByValues).default(sortByValues[0]),
        ),
        order: z.preprocess(
            (value) => {
                if (typeof value !== 'string') {
                    return undefined;
                }

                const normalizedValue = value.trim().toUpperCase();

                return normalizedValue.length > 0 ? normalizedValue : undefined;
            },
            z.enum(sortOrderValues).default('DESC'),
        ),
    });
}

export function paginateItems<T>(
    items: T[],
    page: number,
    limit: number,
): PaginatedResponse<T> {
    const total = items.length;
    const offset = (page - 1) * limit;

    return {
        data: items.slice(offset, offset + limit),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
    };
}

export function sortItems<T, TSortBy extends string>(
    items: T[],
    sortBy: TSortBy,
    order: SortOrder,
    accessors: Record<TSortBy, (item: T) => SortableValue>,
): T[] {
    const direction = order === 'ASC' ? 1 : -1;

    return [...items].sort((left, right) => {
        const leftValue = accessors[sortBy](left);
        const rightValue = accessors[sortBy](right);
        const compareResult = compareValues(leftValue, rightValue);

        return compareResult * direction;
    });
}

function compareValues(left: SortableValue, right: SortableValue) {
    if (left === right) {
        return 0;
    }

    if (left === null || left === undefined) {
        return 1;
    }

    if (right === null || right === undefined) {
        return -1;
    }

    if (left instanceof Date && right instanceof Date) {
        return left.getTime() - right.getTime();
    }

    if (typeof left === 'string' && typeof right === 'string') {
        return left.localeCompare(right, undefined, {
            sensitivity: 'base',
        });
    }

    if (typeof left === 'number' && typeof right === 'number') {
        return left - right;
    }

    return String(left).localeCompare(String(right), undefined, {
        sensitivity: 'base',
    });
}
