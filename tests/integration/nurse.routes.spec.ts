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

    interface MockDepartment {
        id: string;
        name: string;
        location: string;
    }

    interface MockNurse {
        id: string;
        userId: string | null;
        firstName: string;
        lastName: string;
        departmentId: string;
        shift: 'Morning' | 'Evening' | 'Night';
        createdAt: Date;
        updatedAt: Date;
    }

    const nurseRole: MockRole = {
        id: 'role-nurse-id',
        name: 'Nurse',
        normalizedName: 'NURSE',
        description: 'Nurse access',
        isActive: true,
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    };

    const userStore: MockUser[] = [
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
            userRoles: [],
        },
        {
            id: 'user-2',
            firstName: 'Existing',
            lastName: 'Nurse',
            email: 'existing.nurse@example.com',
            normalizedEmail: 'EXISTING.NURSE@EXAMPLE.COM',
            username: 'existing.nurse',
            normalizedUsername: 'EXISTING.NURSE',
            passwordHash: 'hash',
            phoneNumber: null,
            emailConfirmed: true,
            lockoutEnabled: true,
            accessFailedCount: 0,
            isActive: true,
            createdAt: new Date('2026-01-01T10:00:00.000Z'),
            updatedAt: new Date('2026-01-01T10:00:00.000Z'),
            userRoles: [],
        },
    ];
    const departmentStore: MockDepartment[] = [];
    const nurseStore: MockNurse[] = [];
    let departmentCount = 1;
    let nurseCount = 1;
    let userCount = 3;

    function buildNurseEntity(nurse: MockNurse) {
        const department = departmentStore.find(
            (item) => item.id === nurse.departmentId,
        );

        if (!department) {
            throw new Error('Department not found');
        }

        return {
            ...nurse,
            department: {
                id: department.id,
                name: department.name,
                location: department.location,
            },
        };
    }

    function sortNurses(items: MockNurse[]) {
        return [...items].sort((a, b) => {
            const lastNameResult = a.lastName.localeCompare(b.lastName);

            if (lastNameResult !== 0) {
                return lastNameResult;
            }

            return a.firstName.localeCompare(b.firstName);
        });
    }

    return {
        prisma: {
            department: {
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    return (
                        departmentStore.find((item) => item.id === where.id) ?? null
                    );
                }),
            },
            user: {
                findUnique: jest.fn(async ({
                    where,
                    select,
                    include,
                }: {
                    where: { id?: string; normalizedEmail?: string; normalizedUsername?: string };
                    select?: { id?: boolean };
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

                    if (select?.id) {
                        return { id: user.id };
                    }

                    if (include?.userRoles) {
                        return user;
                    }

                    return user;
                }),
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
                delete: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const index = userStore.findIndex((item) => item.id === where.id);

                    if (index === -1) {
                        throw new Error('User not found');
                    }

                    const [user] = userStore.splice(index, 1);

                    return user;
                }),
            },
            role: {
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { normalizedName: string };
                }) => {
                    if (where.normalizedName === 'NURSE') {
                        return nurseRole;
                    }

                    return null;
                }),
                create: jest.fn(async ({
                    data,
                }: {
                    data: MockRole;
                }) => data),
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

                    if (!user) {
                        throw new Error('User not found');
                    }

                    const userRole: MockUserRole = {
                        id: `user-role-${user.userRoles.length + 1}`,
                        userId: data.userId,
                        roleId: data.roleId,
                        createdAt: new Date(),
                        role: nurseRole,
                    };

                    user.userRoles.push(userRole);

                    return userRole;
                }),
                deleteMany: jest.fn(async ({
                    where,
                }: {
                    where: { userId?: string; roleId?: string };
                }) => {
                    const user = where.userId
                        ? userStore.find((item) => item.id === where.userId)
                        : undefined;

                    if (user?.userRoles && where.roleId) {
                        user.userRoles = user.userRoles.filter(
                            (userRole) => userRole.roleId !== where.roleId,
                        );
                    }

                    return { count: 0 };
                }),
            },
            nurse: {
                create: jest.fn(async ({
                    data,
                }: {
                    data: Omit<MockNurse, 'id' | 'createdAt' | 'updatedAt'>;
                }) => {
                    const now = new Date();
                    const nurse: MockNurse = {
                        id: `nurse-${nurseCount}`,
                        ...data,
                        createdAt: now,
                        updatedAt: now,
                    };

                    nurseCount += 1;
                    nurseStore.push(nurse);

                    return buildNurseEntity(nurse);
                }),
                findMany: jest.fn(async ({
                    where,
                }: {
                    where?: { departmentId: string };
                } = {}) => {
                    const nurses = where?.departmentId
                        ? nurseStore.filter(
                            (item) => item.departmentId === where.departmentId,
                        )
                        : nurseStore;

                    return sortNurses(nurses).map(buildNurseEntity);
                }),
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id?: string; userId?: string };
                }) => {
                    const nurse = where.id
                        ? nurseStore.find((item) => item.id === where.id)
                        : nurseStore.find((item) => item.userId === where.userId);

                    return nurse ? buildNurseEntity(nurse) : null;
                }),
                update: jest.fn(async ({
                    where,
                    data,
                }: {
                    where: { id: string };
                    data: Partial<MockNurse>;
                }) => {
                    const nurse = nurseStore.find((item) => item.id === where.id);

                    if (!nurse) {
                        throw new Error('Nurse not found');
                    }

                    Object.assign(nurse, data, {
                        updatedAt: new Date(),
                    });

                    return buildNurseEntity(nurse);
                }),
                delete: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const index = nurseStore.findIndex((item) => item.id === where.id);

                    if (index === -1) {
                        throw new Error('Nurse not found');
                    }

                    const [nurse] = nurseStore.splice(index, 1);

                    return buildNurseEntity(nurse);
                }),
            },
        },
        __resetNurses: () => {
            departmentStore.length = 0;
            nurseStore.length = 0;
            userStore.splice(2);
            userStore.forEach((user) => {
                user.userRoles = [];
            });
            departmentCount = 1;
            nurseCount = 1;
            userCount = 3;
        },
        __seedDepartment: (name: string, location = 'Block A') => {
            const department: MockDepartment = {
                id: `department-${departmentCount}`,
                name,
                location,
            };

            departmentCount += 1;
            departmentStore.push(department);

            return department;
        },
    };
});

import { createApp } from '../../src/app';

const prismaMock = jest.requireMock('../../src/infrastructure/db/prisma') as {
    __resetNurses: () => void;
    __seedDepartment: (
        name: string,
        location?: string,
    ) => {
        id: string;
        name: string;
        location: string;
    };
};

function createAccessToken(roles: string[]) {
    return jwt.sign(
        {
            sub: 'user-1',
            email: 'user@example.com',
            roles,
        },
        env.jwtAccessSecret,
    );
}

describe('Nurse routes', () => {
    const app = createApp();

    beforeEach(() => {
        prismaMock.__resetNurses();
        env.jwtAccessSecret = 'test-access-secret';
    });

    it('should reject unauthenticated requests', async () => {
        const response = await request(app).get('/api/nurses');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    it('should reject nurse creation for non-admin users', async () => {
        const userToken = createAccessToken(['USER']);
        const department = prismaMock.__seedDepartment('Cardiology');

        const response = await request(app)
            .post('/api/nurses')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                firstName: 'Sara',
                lastName: 'Krasniqi',
                departmentId: department.id,
                shift: 'Morning',
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Forbidden');
    });

    it('should validate nurse payload', async () => {
        const adminToken = createAccessToken(['ADMIN']);
        const department = prismaMock.__seedDepartment('Cardiology');

        const response = await request(app)
            .post('/api/nurses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'Sara',
                lastName: 'Krasniqi',
                departmentId: department.id,
                shift: 'Late',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            'Shift must be Morning, Evening, or Night',
        );
    });

    it('should complete the nurse CRUD flow', async () => {
        const adminToken = createAccessToken(['ADMIN']);
        const userToken = createAccessToken(['USER']);
        const cardiology = prismaMock.__seedDepartment('Cardiology');
        const neurology = prismaMock.__seedDepartment('Neurology', 'Block B');

        const createResponse = await request(app)
            .post('/api/nurses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                userId: 'user-2',
                firstName: 'Sara',
                lastName: 'Krasniqi',
                departmentId: cardiology.id,
                shift: 'Morning',
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.userId).toBe('user-2');
        expect(createResponse.body.firstName).toBe('Sara');
        expect(createResponse.body.departmentId).toBe(cardiology.id);
        expect(createResponse.body.shift).toBe('Morning');

        const nurseId = createResponse.body.id as string;

        const listResponse = await request(app)
            .get('/api/nurses')
            .set('Authorization', `Bearer ${userToken}`);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body.data).toHaveLength(1);
        expect(listResponse.body.data[0].id).toBe(nurseId);

        const filterResponse = await request(app)
            .get(`/api/nurses?departmentId=${cardiology.id}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(filterResponse.status).toBe(200);
        expect(filterResponse.body.data).toHaveLength(1);
        expect(filterResponse.body.data[0].departmentId).toBe(cardiology.id);

        const getResponse = await request(app)
            .get(`/api/nurses/${nurseId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.id).toBe(nurseId);

        const updateResponse = await request(app)
            .put(`/api/nurses/${nurseId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                departmentId: neurology.id,
                shift: 'Night',
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.departmentId).toBe(neurology.id);
        expect(updateResponse.body.shift).toBe('Night');

        const filteredAfterUpdateResponse = await request(app)
            .get(`/api/nurses?departmentId=${neurology.id}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(filteredAfterUpdateResponse.status).toBe(200);
        expect(filteredAfterUpdateResponse.body.data).toHaveLength(1);
        expect(filteredAfterUpdateResponse.body.data[0].departmentId).toBe(
            neurology.id,
        );

        const deleteResponse = await request(app)
            .delete(`/api/nurses/${nurseId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(deleteResponse.status).toBe(204);

        const getDeletedResponse = await request(app)
            .get(`/api/nurses/${nurseId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(getDeletedResponse.status).toBe(404);
        expect(getDeletedResponse.body.message).toBe('Nurse not found');
    });

    it('should auto-provision a nurse user when userId is not provided', async () => {
        const adminToken = createAccessToken(['ADMIN']);
        const department = prismaMock.__seedDepartment('Cardiology');

        const response = await request(app)
            .post('/api/nurses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'Lina',
                lastName: 'Berisha',
                departmentId: department.id,
                shift: 'Evening',
                password: 'Nurse123!',
            });

        expect(response.status).toBe(201);
        expect(response.body.userId).toBeTruthy();
        expect(response.body.firstName).toBe('Lina');
        expect(response.body.shift).toBe('Evening');
    });

    it('should auto-provision a nurse user with email and username', async () => {
        const adminToken = createAccessToken(['ADMIN']);
        const department = prismaMock.__seedDepartment('Cardiology');

        const response = await request(app)
            .post('/api/nurses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'Lina',
                lastName: 'Berisha',
                departmentId: department.id,
                shift: 'Night',
                email: 'lina.berisha@example.com',
                username: 'lina.berisha',
                password: 'Nurse123!',
            });

        expect(response.status).toBe(201);
        expect(response.body.userId).toBe('user-3');
        expect(response.body.firstName).toBe('Lina');
        expect(response.body.shift).toBe('Night');
    });
});
