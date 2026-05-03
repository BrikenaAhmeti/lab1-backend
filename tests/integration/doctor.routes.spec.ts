import jwt from 'jsonwebtoken';
import request from 'supertest';
import { env } from '../../src/config/env';

jest.mock('../../src/infrastructure/db/prisma', () => {
    interface MockUser {
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
    }

    const userStore: MockUser[] = [
        { id: 'user-1' },
        { id: 'user-2' },
        { id: 'user-3' },
    ];
    const departmentStore: MockDepartment[] = [];
    const doctorStore: MockDoctor[] = [];
    let departmentCount = 1;
    let doctorCount = 1;

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
                }: {
                    where: { id: string };
                }) => {
                    return userStore.find((item) => item.id === where.id) ?? null;
                }),
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
                    data: Omit<MockDoctor, 'id' | 'createdAt' | 'updatedAt'>;
                }) => {
                    const now = new Date();
                    const doctor: MockDoctor = {
                        id: `doctor-${doctorCount}`,
                        ...data,
                        createdAt: now,
                        updatedAt: now,
                    };

                    doctorCount += 1;
                    doctorStore.push(doctor);

                    return buildDoctorEntity(doctor);
                }),
                findMany: jest.fn(async () => {
                    return sortDoctors(doctorStore).map(buildDoctorEntity);
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
        },
        __resetDoctors: () => {
            departmentStore.length = 0;
            doctorStore.length = 0;
            departmentCount = 1;
            doctorCount = 1;
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
            .get('/api/doctors')
            .set('Authorization', `Bearer ${userToken}`);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body).toHaveLength(1);
        expect(listResponse.body[0].department.name).toBe('Cardiology');

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
});
