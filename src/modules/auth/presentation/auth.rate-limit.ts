import rateLimit from 'express-rate-limit';

export function createAuthLoginRateLimiter() {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true,
        handler: (_req, res) => {
            res.status(429).json({
                success: false,
                message: 'Too many login attempts, please try again in 15 minutes',
                statusCode: 429,
            });
        },
    });
}
