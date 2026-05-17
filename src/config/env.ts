import dotenv from 'dotenv';

dotenv.config();

export const env = {
    port: Number(process.env.PORT || 3005),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || '',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
    corsAllowedOrigins: (
        process.env.CORS_ALLOWED_ORIGINS
        || 'http://localhost:3001,http://127.0.0.1:3001,http://localhost:3000,http://127.0.0.1:3000'
    )
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    refreshTokenCookieName: process.env.REFRESH_TOKEN_COOKIE_NAME || 'refreshToken',
    maxAccessFailedCount: Number(process.env.MAX_ACCESS_FAILED_COUNT || 5),
    adminFirstName: process.env.ADMIN_FIRST_NAME || 'System',
    adminLastName: process.env.ADMIN_LAST_NAME || 'Admin',
    adminEmail: process.env.ADMIN_EMAIL || '',
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || '',
    adminPhoneNumber: process.env.ADMIN_PHONE_NUMBER || '',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    mailFrom: process.env.MAIL_FROM || process.env.SMTP_USER || '',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
};
