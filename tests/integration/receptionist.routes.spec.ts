import jwt from 'jsonwebtoken';
import request from 'supertest';
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

    const receptionistRole: MockRole = {
        id: 'role-receptionist-id',
        name: 'Receptionist',
        normalizedName: 'RECEPTIONIST',
        description: 'Front desk access',
        isActive: true,
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    };

    const adminRole: MockRole = {
        id: 'role-admin-id',
        name: 'Admin',
        normalizedName: 'ADMIN',
        description: 'Admin access',
        isActive: true,
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    };

    const userRole: MockRole = {
        id: 'role-user-id',
        name: 'User',
        normalizedName: 'USER',
        description: 'Standard user',
        isActive: true,
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    };

    const baseUsers = (): MockUser[] => [
        {
            id: 'user-1',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            normalizedEmail: 'ADMIN@EXAMPLE.COM',
            username: 'admin',
            normalizedUsername: 'ADMIN',
            passwordHash: 'hash',
            phoneNumber: null,
            emailConfirmed: true,
            lockoutEnabled: true,
            accessFailedCount: 0,
            isActive: true,
            createdAt: new Date('2026-01-01T10:00:00.000Z'),
            updatedAt: new Date('2026-01-01T10:00:00.000Z'),
            userRoles: [
                {
                    id: 'user-role-admin-1',
                    userId: 'user-1',
                    roleId: adminRole.id,
                    createdAt: new Date('2026-01-01T10:00:00.000Z'),
                    role: adminRole,
                },
            ],
        },
    ];

    const userStore: MockUser[] = baseUsers();
    let userCount = 2;

    function getRole(normalizedName: string) {
        if (normalizedName === 'RECEPTIONIST') {
            return receptionistRole;
        }

        if (normalizedName === 'ADMIN') {
            return adminRole;
        }

        if (normalizedName === 'USER') {
            return userRole;
        }

        return null;
    }

    return {
        prisma: {
            user: {
                findUnique: jest.fn(async ({
                    where,
                    include,
                }: {
                    where: { id?: string; normalizedEmail?: string; normalizedUsername?: string };
                    include?: { userRoles?: { include: { role: true } } };
                }) => {
                    let user: MockUser | undefined;

                    if (where.id) {
                        user = userStore.find((item) => item.id === where.id);
                    } else if (where.normalizedEmail) {
                        user = userStore.find(
                            (item) => item.normalizedEmail === where.normalizedEmail,
                        );
                    } else if (where.normalizedUsername) {
                        user = userStore.find(
                            (item) => item.normalizedUsername === where.normalizedUsername,
                        );
                    }

                    if (!user) {
                        return null;
                    }

                    if (include?.userRoles) {
                        return user;
                    }

                    return user;
                }),
                findMany: jest.fn(async () => userStore),
                create: jest.fn(async ({
                    data,
                }: {
                    data: Omit<MockUser, 'id' | 'createdAt' | 'updatedAt' | 'userRoles'>;
                }) => {
                    const now = new Date();
                    const user: MockUser = {
                        id: `user-${userCount}`,
                        ...data,
                        createdAt: now,
                        updatedAt: now,
                        userRoles: [],
                    };

                    userCount += 1;
                    userStore.push(user);

                    return user;
                }),
                update: jest.fn(async ({
                    where,
                    data,
                }: {
                    where: { id: string };
                    data: Partial<MockUser>;
                }) => {
                    const user = userStore.find((item) => item.id === where.id);

                    if (!user) {
                        throw new Error('User not found');
                    }

                    Object.assign(user, data, { updatedAt: new Date() });

                    return user;
                }),
                delete: jest.fn(async () => {
                    throw new Error('Not implemented');
                }),
            },
            role: {
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id?: string; normalizedName?: string };
                }) => {
                    if (where.id) {
                        return [receptionistRole, adminRole, userRole].find(
                            (role) => role.id === where.id,
                        ) ?? null;
                    }

                    if (where.normalizedName) {
                        return getRole(where.normalizedName);
                    }

                    return null;
                }),
                findMany: jest.fn(async () => [adminRole, receptionistRole, userRole]),
                create: jest.fn(async ({
                    data,
                }: {
                    data: MockRole;
                }) => data),
                update: jest.fn(async () => receptionistRole),
                delete: jest.fn(async () => receptionistRole),
            },
            userRole: {
                findMany: jest.fn(async ({
                    where,
                }: {
                    where: { userId: string };
                }) => {
                    const user = userStore.find((item) => item.id === where.userId);

                    return user?.userRoles ?? [];
                }),
                create: jest.fn(async ({
                    data,
                }: {
                    data: { userId: string; roleId: string };
                }) => {
                    const user = userStore.find((item) => item.id === data.userId);
                    const role = [receptionistRole, adminRole, userRole].find(
                        (item) => item.id === data.roleId,
                    );

                    if (!user || !role) {
                        throw new Error('User or role not found');
                    }

                    const userRoleItem: MockUserRole = {
                        id: `user-role-${user.userRoles.length + 1}`,
                        userId: data.userId,
                        roleId: data.roleId,
                        createdAt: new Date(),
                        role,
                    };

                    user.userRoles.push(userRoleItem);

                    return userRoleItem;
                }),
                deleteMany: jest.fn(async () => ({ count: 0 })),
            },
            userClaim: {
                create: jest.fn(),
                findMany: jest.fn(async () => []),
            },
            userToken: {
                upsert: jest.fn(async ({ create }: { create: unknown }) => create),
                findMany: jest.fn(async () => []),
            },
            refreshToken: {
                create: jest.fn(),
                findUnique: jest.fn(async () => null),
                update: jest.fn(),
                updateMany: jest.fn(async () => ({ count: 0 })),
                deleteMany: jest.fn(async () => ({ count: 0 })),
                findMany: jest.fn(async () => []),
            },
        },
        __resetReceptionists: () => {
            userStore.splice(0, userStore.length, ...baseUsers());
            userCount = 2;
        },
    };
});

import { createApp } from '../../src/app';

const prismaMock = jest.requireMock('../../src/infrastructure/db/prisma') as {
    __resetReceptionists: () => void;
};

function createAccessToken(roles: string[]) {
    return jwt.sign(
        {
            sub: 'user-1',
            email: 'admin@example.com',
            roles,
        },
        env.jwtAccessSecret,
    );
}

describe('Receptionist routes', () => {
    const app = createApp();

    beforeEach(() => {
        prismaMock.__resetReceptionists();
        env.jwtAccessSecret = 'test-access-secret';
        env.jwtRefreshSecret = 'test-refresh-secret';
        env.jwtAccessExpiresIn = '15m';
        env.jwtRefreshExpiresIn = '7d';
        env.bcryptSaltRounds = 12;
        env.maxAccessFailedCount = 5;
    });

    it('should reject receptionist creation for non-admin users', async () => {
        const token = createAccessToken(['USER']);

        const response = await request(app)
            .post('/api/auth/users/receptionists')
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'Lira',
                lastName: 'Gashi',
                email: 'lira@example.com',
                password: 'Reception123!',
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Forbidden');
    });

    it('should create a receptionist with the receptionist role', async () => {
        const token = createAccessToken(['ADMIN']);

        const response = await request(app)
            .post('/api/auth/users/receptionists')
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'Lira',
                lastName: 'Gashi',
                email: 'lira@example.com',
                username: 'lira.gashi',
                password: 'Reception123!',
                phoneNumber: '+38344111222',
            });

        expect(response.status).toBe(201);
        expect(response.body.email).toBe('lira@example.com');
        expect(response.body.username).toBe('lira.gashi');
        expect(response.body.roles).toEqual(['RECEPTIONIST']);
    });
});
