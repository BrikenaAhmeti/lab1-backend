import jwt from 'jsonwebtoken';
import request from 'supertest';
import { env } from '../../src/config/env';

jest.mock('../../src/infrastructure/db/prisma', () => {
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

    interface MockDepartment {
        id: string;
        name: string;
        location: string;
    }

    interface MockDoctor {
        id: string;
        userId: string | null;
        firstName: string;
        lastName: string;
        specialization: string;
        departmentId: string;
        phoneNumber: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }

    const doctorRole: MockRole = {
        id: 'role-doctor-id',
        name: 'Doctor',
        normalizedName: 'DOCTOR',
        description: 'Doctor access',
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
            lastName: 'Doctor',
            email: 'existing.doctor@example.com',
            normalizedEmail: 'EXISTING.DOCTOR@EXAMPLE.COM',
            username: 'existing.doctor',
            normalizedUsername: 'EXISTING.DOCTOR',
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
            id: 'user-3',
            firstName: 'Existing',
            lastName: 'Doctor Two',
            email: 'existing.doctor2@example.com',
            normalizedEmail: 'EXISTING.DOCTOR2@EXAMPLE.COM',
            username: 'existing.doctor2',
            normalizedUsername: 'EXISTING.DOCTOR2',
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
    const doctorStore: MockDoctor[] = [];
    let departmentCount = 1;
    let doctorCount = 1;
    let userCount = 4;

    function buildDoctorEntity(doctor: MockDoctor) {
        const department = departmentStore.find(
            (item) => item.id === doctor.departmentId,
        );

        if (!department) {
            throw new Error('Department not found');
        }

        return {
            ...doctor,
            department: {
                id: department.id,
                name: department.name,
                location: department.location,
            },
        };
    }

    function sortDoctors(items: MockDoctor[]) {
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
                    if (where.normalizedName === 'DOCTOR') {
                        return doctorRole;
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
                        role: doctorRole,
                    };

                    user.userRoles.push(userRole);

                    return userRole;
                }),
                deleteMany: jest.fn(async () => ({ count: 0 })),
            },
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
            doctor: {
                create: jest.fn(async ({
                    data,
                }: {
                    data: Omit<MockDoctor, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>;
                }) => {
                    const now = new Date();
                    const doctor: MockDoctor = {
                        id: `doctor-${doctorCount}`,
                        isActive: true,
                        ...data,
                        createdAt: now,
                        updatedAt: now,
                    };

                    doctorCount += 1;
                    doctorStore.push(doctor);

                    return buildDoctorEntity(doctor);
                }),
                findMany: jest.fn(async () => {
                    return sortDoctors(
                        doctorStore.filter((item) => item.isActive),
                    ).map(buildDoctorEntity);
                }),
                findFirst: jest.fn(async ({
                    where,
                }: {
                    where: { id?: string; userId?: string; isActive?: boolean };
                }) => {
                    if (where.id) {
                        const doctor = doctorStore.find(
                            (item) => item.id === where.id
                                && (
                                    where.isActive === undefined
                                    || item.isActive === where.isActive
                                ),
                        );

                        return doctor ? buildDoctorEntity(doctor) : null;
                    }

                    if (where.userId) {
                        const doctor = doctorStore.find(
                            (item) => item.userId === where.userId,
                        );

                        return doctor ? buildDoctorEntity(doctor) : null;
                    }

                    return null;
                }),
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id?: string; userId?: string };
                }) => {
                    if (where.id) {
                        const doctor = doctorStore.find((item) => item.id === where.id);

                        return doctor ? buildDoctorEntity(doctor) : null;
                    }

                    if (where.userId) {
                        const doctor = doctorStore.find(
                            (item) => item.userId === where.userId,
                        );

                        return doctor ? buildDoctorEntity(doctor) : null;
                    }

                    return null;
                }),
                update: jest.fn(async ({
                    where,
                    data,
                }: {
                    where: { id: string };
                    data: Partial<MockDoctor>;
                }) => {
                    const doctor = doctorStore.find((item) => item.id === where.id);

                    if (!doctor) {
                        throw new Error('Doctor not found');
                    }

                    Object.assign(doctor, data, {
                        updatedAt: new Date(),
                    });

                    return buildDoctorEntity(doctor);
                }),
                delete: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const index = doctorStore.findIndex((item) => item.id === where.id);

                    if (index === -1) {
                        throw new Error('Doctor not found');
                    }

                    const [doctor] = doctorStore.splice(index, 1);

                    return buildDoctorEntity(doctor);
                }),
            },
            appointment: {
                count: jest.fn(async () => 0),
            },
            medicalRecord: {
                count: jest.fn(async () => 0),
            },
        },
        __resetDoctors: () => {
            departmentStore.length = 0;
            doctorStore.length = 0;
            userStore.splice(3);
            userStore.forEach((user) => {
                user.userRoles = [];
            });
            departmentCount = 1;
            doctorCount = 1;
            userCount = 4;
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
    __resetDoctors: () => void;
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

describe('Doctor routes', () => {
    const app = createApp();

    beforeEach(() => {
        prismaMock.__resetDoctors();
        env.jwtAccessSecret = 'test-access-secret';
    });

    it('should reject unauthenticated requests', async () => {
        const response = await request(app).get('/api/doctors');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    it('should validate doctor payload', async () => {
        const adminToken = createAccessToken(['ADMIN']);
        const department = prismaMock.__seedDepartment('Cardiology');

        const response = await request(app)
            .post('/api/doctors')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                userId: 'user-2',
                firstName: 'Arben',
                lastName: 'Hoxha',
                departmentId: department.id,
                phoneNumber: '+38344111222',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Specialization is required');
    });

    it('should complete the doctor CRUD flow', async () => {
        const adminToken = createAccessToken(['ADMIN']);
        const userToken = createAccessToken(['USER']);
        const cardiology = prismaMock.__seedDepartment('Cardiology', 'Block A');
        const neurology = prismaMock.__seedDepartment('Neurology', 'Block B');

        const forbiddenCreateResponse = await request(app)
            .post('/api/doctors')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                userId: 'user-2',
                firstName: 'Arben',
                lastName: 'Hoxha',
                specialization: 'Cardiology',
                departmentId: cardiology.id,
                phoneNumber: '+38344111222',
            });

        expect(forbiddenCreateResponse.status).toBe(403);
        expect(forbiddenCreateResponse.body.message).toBe('Forbidden');

        const createResponse = await request(app)
            .post('/api/doctors')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                userId: 'user-2',
                firstName: 'Arben',
                lastName: 'Hoxha',
                specialization: 'Cardiology',
                departmentId: cardiology.id,
                phoneNumber: '+38344111222',
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.firstName).toBe('Arben');
        expect(createResponse.body.department.name).toBe('Cardiology');

        const doctorId = createResponse.body.id as string;

        const listResponse = await request(app)
            .get(
                `/api/doctors?page=1&limit=10&sortBy=last_name&order=ASC&departmentId=${cardiology.id}&specialization=cardio`,
            )
            .set('Authorization', `Bearer ${userToken}`);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body.data).toHaveLength(1);
        expect(listResponse.body.data[0].department.name).toBe('Cardiology');

        const getResponse = await request(app)
            .get(`/api/doctors/${doctorId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.id).toBe(doctorId);
        expect(getResponse.body.department.name).toBe('Cardiology');

        const updateResponse = await request(app)
            .put(`/api/doctors/${doctorId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                specialization: 'Neurology',
                departmentId: neurology.id,
                phoneNumber: '+38344123456',
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.specialization).toBe('Neurology');
        expect(updateResponse.body.phoneNumber).toBe('+38344123456');
        expect(updateResponse.body.department.name).toBe('Neurology');

        const forbiddenDeleteResponse = await request(app)
            .delete(`/api/doctors/${doctorId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(forbiddenDeleteResponse.status).toBe(403);
        expect(forbiddenDeleteResponse.body.message).toBe('Forbidden');

        const deleteResponse = await request(app)
            .delete(`/api/doctors/${doctorId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(deleteResponse.status).toBe(204);

        const getDeletedResponse = await request(app)
            .get(`/api/doctors/${doctorId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(getDeletedResponse.status).toBe(404);
        expect(getDeletedResponse.body.message).toBe('Doctor not found');
    });

    it('should auto-provision a doctor user with email and username', async () => {
        const adminToken = createAccessToken(['ADMIN']);
        const department = prismaMock.__seedDepartment('Cardiology', 'Block A');

        const response = await request(app)
            .post('/api/doctors')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'Elira',
                lastName: 'Dema',
                specialization: 'Pediatrics',
                departmentId: department.id,
                phoneNumber: '+38344123456',
                email: 'elira.dema@example.com',
                username: 'elira.dema',
                password: 'Doctor123!',
            });

        expect(response.status).toBe(201);
        expect(response.body.firstName).toBe('Elira');
        expect(response.body.userId).toBe('user-4');
        expect(response.body.departmentId).toBe(department.id);
    });
});
