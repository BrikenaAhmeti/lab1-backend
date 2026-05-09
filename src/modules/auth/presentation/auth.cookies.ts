import { Request, Response } from 'express';
import { env } from '../../../config/env';

const refreshTokenCookieBaseOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: env.nodeEnv === 'production',
    path: '/',
};

const refreshTokenCookieOptions = {
    ...refreshTokenCookieBaseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export function setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie(
        env.refreshTokenCookieName,
        refreshToken,
        refreshTokenCookieOptions,
    );
}

export function clearRefreshTokenCookie(res: Response) {
    res.clearCookie(env.refreshTokenCookieName, refreshTokenCookieBaseOptions);
}

export function readRefreshToken(req: Request): string | null {
    const refreshTokenFromBody = typeof req.body?.refreshToken === 'string'
        ? req.body.refreshToken.trim()
        : '';

    if (refreshTokenFromBody) {
        return refreshTokenFromBody;
    }

    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
        return null;
    }

    const cookies = cookieHeader.split(';');

    for (const cookie of cookies) {
        const [name, ...valueParts] = cookie.split('=');

        if (name?.trim() !== env.refreshTokenCookieName) {
            continue;
        }

        const value = valueParts.join('=').trim();

        return value ? decodeURIComponent(value) : null;
    }

    return null;
}
