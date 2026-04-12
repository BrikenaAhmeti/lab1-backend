import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../core/errors/app-error';
import { env } from '../../config/env';
import { RequestWithUser } from '../core/types/request-with-user';

interface AccessTokenPayload extends jwt.JwtPayload {
    sub: string;
    email: string;
    roles: string[];
}

export function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction,
) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new AppError('Unauthorized', 401);
    }

    const token = authorization.slice(7);

    try {
        const payload = jwt.verify(
            token,
            env.jwtAccessSecret,
        ) as AccessTokenPayload;

        const requestWithUser = req as RequestWithUser;

        requestWithUser.user = {
            id: payload.sub,
            email: payload.email,
            roles: payload.roles ?? [],
        };

        return next();
    } catch {
        throw new AppError('Unauthorized', 401);
    }
}
