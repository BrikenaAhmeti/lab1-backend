import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
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

    if (env.nodeEnv !== 'test') {
        console.error(error);
    }

    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        statusCode: 500,
    });
}
