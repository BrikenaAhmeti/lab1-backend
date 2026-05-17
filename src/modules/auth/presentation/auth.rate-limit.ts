import { Request } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthRepository } from '../domain/auth.repository';
import { AuthPrismaRepository } from '../infrastructure/auth.prisma.repository';

export function createAuthLoginRateLimiter(
    authRepository: AuthRepository = new AuthPrismaRepository(),
) {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true,
        skip: (req) => isAdminLoginAttempt(req, authRepository),
        handler: (_req, res) => {
            res.status(429).json({
                success: false,
                message: 'Too many login attempts, please try again in 15 minutes',
                statusCode: 429,
            });
        },
    });
}

async function isAdminLoginAttempt(
    req: Request,
    authRepository: AuthRepository,
): Promise<boolean> {
    const normalizedIdentifier = getNormalizedLoginIdentifier(req);

    if (!normalizedIdentifier) {
        return false;
    }

    try {
        const user =
            await authRepository.findUserByNormalizedEmail(normalizedIdentifier)
            ?? await authRepository.findUserByNormalizedUsername(normalizedIdentifier);

        return Boolean(
            user?.userRoles.some(
                (userRole) => userRole.role.normalizedName === 'ADMIN',
            ),
        );
    } catch {
        return false;
    }
}

function getNormalizedLoginIdentifier(req: Request): string | null {
    if (!req.body || typeof req.body !== 'object') {
        return null;
    }

    const body = req.body as Record<string, unknown>;
    const identifier = body.identifier ?? body.email;

    if (typeof identifier !== 'string' || identifier.trim().length === 0) {
        return null;
    }

    return identifier.trim().toUpperCase();
}
