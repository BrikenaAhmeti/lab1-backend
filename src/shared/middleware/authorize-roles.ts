import { NextFunction, Request, Response } from 'express';
import { AppError } from '../core/errors/app-error';
import { RequestWithUser } from '../core/types/request-with-user';

export function authorizeRoles(...allowedRoles: string[]) {
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toUpperCase());

    return (req: Request, _res: Response, next: NextFunction) => {
        const requestWithUser = req as RequestWithUser;
        const userRoles = requestWithUser.user.roles.map((role) => role.toUpperCase());
        const hasRole = userRoles.some((role) => normalizedAllowedRoles.includes(role));

        if (!hasRole) {
            throw new AppError('Forbidden', 403);
        }

        return next();
    };
}
