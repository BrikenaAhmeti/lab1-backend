import { Transform } from 'class-transformer';
import {
    ValidateIf,
    ValidationArguments,
    ValidationOptions,
    registerDecorator,
} from 'class-validator';

function resolveValue(
    value: unknown,
    obj: Record<string, unknown> | undefined,
    aliases: string[],
) {
    if (value !== undefined) {
        return value;
    }

    if (!obj) {
        return value;
    }

    for (const alias of aliases) {
        const aliasValue = obj[alias];

        if (aliasValue !== undefined) {
            return aliasValue;
        }
    }

    return value;
}

export function NormalizeString(...aliases: string[]) {
    return Transform(({ value, obj }) => {
        const resolvedValue = resolveValue(
            value,
            obj as Record<string, unknown> | undefined,
            aliases,
        );

        return typeof resolvedValue === 'string'
            ? resolvedValue.trim()
            : resolvedValue;
    });
}

export function NormalizeNullableString(...aliases: string[]) {
    return Transform(({ value, obj }) => {
        const resolvedValue = resolveValue(
            value,
            obj as Record<string, unknown> | undefined,
            aliases,
        );

        if (resolvedValue === null) {
            return null;
        }

        if (typeof resolvedValue !== 'string') {
            return undefined;
        }

        return resolvedValue.trim();
    });
}

export function NormalizeUppercaseString(...aliases: string[]) {
    return Transform(({ value, obj }) => {
        const resolvedValue = resolveValue(
            value,
            obj as Record<string, unknown> | undefined,
            aliases,
        );

        return typeof resolvedValue === 'string'
            ? resolvedValue.trim().toUpperCase()
            : resolvedValue;
    });
}

export function NormalizeNumber(...aliases: string[]) {
    return Transform(({ value, obj }) => {
        const resolvedValue = resolveValue(
            value,
            obj as Record<string, unknown> | undefined,
            aliases,
        );

        if (typeof resolvedValue !== 'string') {
            return resolvedValue;
        }

        const trimmedValue = resolvedValue.trim();

        if (trimmedValue.length === 0) {
            return resolvedValue;
        }

        return Number(trimmedValue);
    });
}

export function OptionalField() {
    return ValidateIf((_object, value) => value !== undefined);
}

export function OptionalNullableField() {
    return ValidateIf((_object, value) => value !== undefined && value !== null);
}

export function IsDateOnlyString(validationOptions?: ValidationOptions) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            name: 'isDateOnlyString',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                        return false;
                    }

                    return !Number.isNaN(
                        new Date(`${value}T00:00:00.000Z`).getTime(),
                    );
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be in YYYY-MM-DD format`;
                },
            },
        });
    };
}

export function IsTimeString(validationOptions?: ValidationOptions) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            name: 'isTimeString',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown) {
                    return (
                        typeof value === 'string'
                        && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)
                    );
                },
                defaultMessage() {
                    return 'Time must be in HH:mm format';
                },
            },
        });
    };
}

export function HasMaxTwoDecimalPlaces(
    validationOptions?: ValidationOptions,
) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            name: 'hasMaxTwoDecimalPlaces',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown) {
                    return (
                        typeof value === 'number'
                        && Number.isFinite(value)
                        && Number.isInteger(value * 100)
                    );
                },
                defaultMessage() {
                    return 'Amount can have up to 2 decimal places';
                },
            },
        });
    };
}
