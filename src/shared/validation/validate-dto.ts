import { plainToInstance, ClassConstructor } from 'class-transformer';
import { ValidationError, validateSync } from 'class-validator';
import { AppError, AppErrorDetail } from '../core/errors/app-error';

type DtoClass<T extends object> = ClassConstructor<T> & {
    normalize?: (input: unknown) => unknown;
};

export function validateDto<T extends object>(
    dtoClass: DtoClass<T>,
    input: unknown,
): T {
    const normalizedInput = dtoClass.normalize
        ? dtoClass.normalize(input)
        : input;
    const dto = plainToInstance(dtoClass, normalizeInput(normalizedInput));
    const validationErrors = validateSync(dto, {
        whitelist: true,
        validationError: {
            target: false,
            value: false,
        },
    });
    const errors = dedupeErrors(flattenValidationErrors(validationErrors));

    if (errors.length > 0) {
        throw new AppError(errors[0].message, 400, errors);
    }

    return dto;
}

export function assertAtLeastOneField<T extends object>(
    dto: T,
    fields: Array<keyof T>,
    message = 'At least one field is required',
) {
    const hasAtLeastOneField = fields.some((field) => dto[field] !== undefined);

    if (!hasAtLeastOneField) {
        throw new AppError(message, 400, [
            {
                field: 'body',
                message,
            },
        ]);
    }
}

function normalizeInput(input: unknown): Record<string, unknown> {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return {};
    }

    return input as Record<string, unknown>;
}

function flattenValidationErrors(
    errors: ValidationError[],
    parentPath?: string,
): AppErrorDetail[] {
    return errors.flatMap((error) => {
        const field = parentPath
            ? `${parentPath}.${error.property}`
            : error.property;
        const currentErrors = Object.values(error.constraints ?? {}).map(
            (message) => ({
                field,
                message,
            }),
        );
        const childErrors = flattenValidationErrors(error.children ?? [], field);

        return [...currentErrors, ...childErrors];
    });
}

function dedupeErrors(errors: AppErrorDetail[]) {
    const seen = new Set<string>();

    return errors.filter((error) => {
        const key = `${error.field ?? ''}:${error.message}`;

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);

        return true;
    });
}
