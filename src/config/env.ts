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
    maxAccessFailedCount: Number(process.env.MAX_ACCESS_FAILED_COUNT || 5),
    adminFirstName: process.env.ADMIN_FIRST_NAME || 'System',
    adminLastName: process.env.ADMIN_LAST_NAME || 'Admin',
    adminEmail: process.env.ADMIN_EMAIL || '',
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || '',
    adminPhoneNumber: process.env.ADMIN_PHONE_NUMBER || '',
};
