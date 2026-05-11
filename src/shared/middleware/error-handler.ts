import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../../generated/prisma';
import { AppError } from '../core/errors/app-error';
import { env } from '../../config/env';

export function errorHandler(
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            ...(error.errors ? { errors: error.errors } : {}),
            statusCode: error.statusCode,
        });
    }

    if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
            field: issue.path.join('.') || 'body',
            message: issue.message,
        }));

        return res.status(400).json({
            success: false,
            message: errors[0]?.message ?? 'Validation failed',
            errors,
            statusCode: 400,
        });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const mappedError = mapPrismaError(error);

        return res.status(mappedError.statusCode).json({
            success: false,
            message: mappedError.message,
            statusCode: mappedError.statusCode,
        });
    }

    if (env.nodeEnv !== 'test') {
        console.error(error);
    }

    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        statusCode: 500,
    });
}

function mapPrismaError(
    error: Prisma.PrismaClientKnownRequestError,
): AppError {
    switch (error.code) {
        case 'P2002':
            return new AppError('Resource already exists', 409);
        case 'P2003':
            return new AppError('Resource cannot be deleted while it is in use', 409);
        case 'P2025':
            return new AppError('Resource not found', 404);
        default:
            return new AppError('Internal server error', 500);
    }
}
