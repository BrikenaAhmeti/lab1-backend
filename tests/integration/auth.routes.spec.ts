import bcrypt from 'bcrypt';
import request from 'supertest';
import { createApp } from '../../src/app';
import { env } from '../../src/config/env';

jest.mock('../../src/infrastructure/db/prisma', () => {
    interface MockRole {
        id: string;
        name: string;
        normalizedName: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }

    interface MockUserRole {
        id: string;
        userId: string;
        roleId: string;
        createdAt: Date;
        role: MockRole;
    }

    interface MockUser {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        normalizedEmail: string;
        username: string;
        normalizedUsername: string;
        passwordHash: string;
        phoneNumber: string | null;
        emailConfirmed: boolean;
        lockoutEnabled: boolean;
        accessFailedCount: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userRoles: MockUserRole[];
    }

    interface MockRefreshToken {
        id: string;
        userId: string;
        tokenId: string;
        tokenHash: string;
        expires: Date;
        created: Date;
        revoked: Date | null;
        replacedByTokenId: string | null;
    }

    interface MockUserToken {
        id: string;
        userId: string;
        loginProvider: string;
        tokenName: string;
        tokenValue: string;
        createdAt: Date;
    }

    const userRole: MockRole = {
        id: 'role-user-id',
        name: 'User',
        normalizedName: 'USER',
        description: 'Standard user',
        isActive: true,
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    };

    const adminRole: MockRole = {
        id: 'role-admin-id',
        name: 'Admin',
        normalizedName: 'ADMIN',
        description: 'Full access',
        isActive: true,
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    };

    const baseUser = () => {
        const now = new Date('2026-01-01T10:00:00.000Z');

        return {
            id: 'user-1',
            firstName: 'Ana',
            lastName: 'Krasniqi',
            email: 'ana@example.com',
            normalizedEmail: 'ANA@EXAMPLE.COM',
            username: 'ana',
            normalizedUsername: 'ANA',
            passwordHash: bcrypt.hashSync('password123', 12),
            phoneNumber: null,
            emailConfirmed: true,
            lockoutEnabled: true,
            accessFailedCount: 0,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            userRoles: [
                {
                    id: 'user-role-1',
                    userId: 'user-1',
                    roleId: userRole.id,
                    createdAt: now,
                    role: userRole,
                },
            ],
        } satisfies MockUser;
    };

    const baseAdmin = () => {
        const now = new Date('2026-01-01T10:00:00.000Z');

        return {
            id: 'admin-user-1',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            normalizedEmail: 'ADMIN@EXAMPLE.COM',
            username: 'admin',
            normalizedUsername: 'ADMIN',
            passwordHash: bcrypt.hashSync('admin-password', 12),
            phoneNumber: null,
            emailConfirmed: true,
            lockoutEnabled: true,
            accessFailedCount: 0,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            userRoles: [
                {
                    id: 'admin-user-role-1',
                    userId: 'admin-user-1',
                    roleId: adminRole.id,
                    createdAt: now,
                    role: adminRole,
                },
            ],
        } satisfies MockUser;
    };

    const userStore: MockUser[] = [baseUser(), baseAdmin()];
    const refreshTokenStore: MockRefreshToken[] = [];
    const userTokenStore: MockUserToken[] = [];

    return {
        prisma: {
            user: {
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id?: string; normalizedEmail?: string; normalizedUsername?: string };
                }) => {
                    if (where.id) {
                        return userStore.find((user) => user.id === where.id) ?? null;
                    }

                    if (where.normalizedEmail) {
                        return userStore.find(
                            (user) => user.normalizedEmail === where.normalizedEmail,
                        ) ?? null;
                    }

                    if (where.normalizedUsername) {
                        return userStore.find(
                            (user) => user.normalizedUsername === where.normalizedUsername,
                        ) ?? null;
                    }

                    return null;
                }),
                update: jest.fn(async ({
                    where,
                    data,
                }: {
                    where: { id: string };
                    data: {
                        accessFailedCount?: { increment: number } | number;
                    };
                }) => {
                    const user = userStore.find((item) => item.id === where.id);

                    if (!user) {
                        throw new Error('User not found');
                    }

                    if (typeof data.accessFailedCount === 'number') {
                        user.accessFailedCount = data.accessFailedCount;
                    }

                    if (
                        typeof data.accessFailedCount === 'object'
                        && typeof data.accessFailedCount.increment === 'number'
                    ) {
                        user.accessFailedCount += data.accessFailedCount.increment;
                    }

                    user.updatedAt = new Date();

                    return {
                        ...user,
                    };
                }),
            },
            refreshToken: {
                create: jest.fn(async ({
                    data,
                }: {
                    data: Omit<MockRefreshToken, 'id' | 'created' | 'revoked' | 'replacedByTokenId'>;
                }) => {
                    const refreshToken: MockRefreshToken = {
                        id: `refresh-token-${refreshTokenStore.length + 1}`,
                        ...data,
                        created: new Date(),
                        revoked: null,
                        replacedByTokenId: null,
                    };

                    refreshTokenStore.push(refreshToken);

                    return refreshToken;
                }),
                deleteMany: jest.fn(async () => ({ count: 0 })),
            },
            userToken: {
                upsert: jest.fn(async ({
                    create,
                }: {
                    create: Omit<MockUserToken, 'id' | 'createdAt'>;
                }) => {
                    const userToken: MockUserToken = {
                        id: `user-token-${userTokenStore.length + 1}`,
                        ...create,
                        createdAt: new Date(),
                    };

                    userTokenStore.push(userToken);

                    return userToken;
                }),
            },
        },
        __resetAuthStore: () => {
            userStore.splice(0, userStore.length, baseUser(), baseAdmin());
            refreshTokenStore.length = 0;
            userTokenStore.length = 0;
        },
    };
});

const prismaMock = jest.requireMock('../../src/infrastructure/db/prisma') as {
    __resetAuthStore: () => void;
};

describe('Auth routes', () => {
    beforeEach(() => {
        prismaMock.__resetAuthStore();
        env.nodeEnv = 'test';
        env.jwtAccessSecret = 'test-access-secret';
        env.jwtRefreshSecret = 'test-refresh-secret';
        env.jwtAccessExpiresIn = '15m';
        env.jwtRefreshExpiresIn = '7d';
        env.bcryptSaltRounds = 12;
        env.maxAccessFailedCount = 5;
        env.refreshTokenCookieName = 'refreshToken';
        env.corsAllowedOrigins = ['http://localhost:3001'];
    });

    it('should set refresh token cookie on successful login', async () => {
        const app = createApp();

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                identifier: 'ana@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(200);
        expect(response.body.accessToken).toBeTruthy();
        expect(response.body.refreshToken).toBeTruthy();
        expect(response.headers['set-cookie']).toEqual(
            expect.arrayContaining([
                expect.stringContaining('refreshToken='),
            ]),
        );
    });

    it('should rate limit repeated failed login attempts', async () => {
        const app = createApp();

        for (let attempt = 1; attempt <= 5; attempt += 1) {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    identifier: 'erza@example.com',
                    password: 'wrong-password',
                });

            expect(response.status).not.toBe(429);
        }

        const blockedResponse = await request(app)
            .post('/api/auth/login')
            .send({
                identifier: 'erza@example.com',
                password: 'wrong-password',
            });

        expect(blockedResponse.status).toBe(429);
        expect(blockedResponse.body).toEqual({
            success: false,
            message: 'Too many login attempts, please try again in 15 minutes',
            statusCode: 429,
        });
    });

    it('should not rate limit repeated failed admin login attempts', async () => {
        const app = createApp();

        for (let attempt = 1; attempt <= 6; attempt += 1) {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    identifier: 'admin@example.com',
                    password: 'wrong-password',
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid email or password');
        }
    });
});
