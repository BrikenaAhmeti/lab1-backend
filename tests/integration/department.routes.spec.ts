import jwt from 'jsonwebtoken';
import request from 'supertest';
import { env } from '../../src/config/env';

jest.mock('../../src/infrastructure/db/prisma', () => {
    interface MockDepartment {
        id: string;
        name: string;
        description: string | null;
        location: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
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

    interface MockRoom {
        id: string;
        roomNumber: string;
        departmentId: string;
        type: string;
        status: string;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }

    interface MockNurse {
        id: string;
        firstName: string;
        lastName: string;
        departmentId: string;
        shift: string;
        createdAt: Date;
        updatedAt: Date;
    }

    const departmentStore: MockDepartment[] = [];
    const doctorStore: MockDoctor[] = [];
    const roomStore: MockRoom[] = [];
    const nurseStore: MockNurse[] = [];
    let departmentCount = 1;
    let doctorCount = 1;
    let roomCount = 1;
    let nurseCount = 1;

    function sortDepartments(items: MockDepartment[]) {
        return [...items].sort((a, b) => a.name.localeCompare(b.name));
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

    function sortRooms(items: MockRoom[]) {
        return [...items].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
    }

    return {
        prisma: {
            department: {
                create: jest.fn(async ({
                    data,
                }: {
                    data: {
                        name: string;
                        description?: string | null;
                        location: string;
                    };
                }) => {
                    const now = new Date();
                    const department: MockDepartment = {
                        id: `department-${departmentCount}`,
                        name: data.name,
                        description: data.description ?? null,
                        location: data.location,
                        isActive: true,
                        createdAt: now,
                        updatedAt: now,
                    };

                    departmentCount += 1;
                    departmentStore.push(department);

                    return department;
                }),
                findMany: jest.fn(async () => {
                    return sortDepartments(departmentStore);
                }),
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id?: string; name?: string };
                }) => {
                    if (where.id) {
                        return departmentStore.find((item) => item.id === where.id) ?? null;
                    }

                    if (where.name) {
                        return departmentStore.find((item) => item.name === where.name) ?? null;
                    }

                    return null;
                }),
                update: jest.fn(async ({
                    where,
                    data,
                }: {
                    where: { id: string };
                    data: {
                        name: string;
                        description?: string | null;
                        location: string;
                    };
                }) => {
                    const department = departmentStore.find((item) => item.id === where.id);

                    if (!department) {
                        throw new Error('Department not found');
                    }

                    Object.assign(department, data, {
                        updatedAt: new Date(),
                    });

                    return department;
                }),
                delete: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const index = departmentStore.findIndex(
                        (item) => item.id === where.id,
                    );

                    if (index === -1) {
                        throw new Error('Department not found');
                    }

                    return departmentStore.splice(index, 1)[0];
                }),
            },
            doctor: {
                findMany: jest.fn(async ({
                    where,
                }: {
                    where: { departmentId: string };
                }) => {
                    const doctors = doctorStore.filter(
                        (item) => item.departmentId === where.departmentId,
                    );

                    return sortDoctors(doctors);
                }),
                count: jest.fn(async ({
                    where,
                }: {
                    where: { departmentId: string };
                }) => {
                    return doctorStore.filter(
                        (item) => item.departmentId === where.departmentId,
                    ).length;
                }),
            },
            room: {
                findMany: jest.fn(async ({
                    where,
                }: {
                    where: { departmentId: string };
                }) => {
                    const rooms = roomStore.filter(
                        (item) => item.departmentId === where.departmentId,
                    );

                    return sortRooms(rooms);
                }),
                count: jest.fn(async ({
                    where,
                }: {
                    where: { departmentId: string };
                }) => {
                    return roomStore.filter(
                        (item) => item.departmentId === where.departmentId,
                    ).length;
                }),
            },
            nurse: {
                count: jest.fn(async ({
                    where,
                }: {
                    where: { departmentId: string };
                }) => {
                    return nurseStore.filter(
                        (item) => item.departmentId === where.departmentId,
                    ).length;
                }),
            },
        },
        __resetDepartments: () => {
            departmentStore.length = 0;
            doctorStore.length = 0;
            roomStore.length = 0;
            nurseStore.length = 0;
            departmentCount = 1;
            doctorCount = 1;
            roomCount = 1;
            nurseCount = 1;
        },
        __seedDoctor: (departmentId: string) => {
            const now = new Date();

            doctorStore.push({
                id: `doctor-${doctorCount}`,
                userId: `user-${doctorCount}`,
                firstName: 'Arben',
                lastName: 'Hoxha',
                specialization: 'Cardiology',
                departmentId,
                phoneNumber: '+38344111222',
                createdAt: now,
                updatedAt: now,
            });

            doctorCount += 1;
        },
        __seedRoom: (departmentId: string) => {
            const now = new Date();

            roomStore.push({
                id: `room-${roomCount}`,
                roomNumber: `${100 + roomCount}`,
                departmentId,
                type: 'STANDARD',
                status: 'AVAILABLE',
                capacity: 2,
                createdAt: now,
                updatedAt: now,
            });

            roomCount += 1;
        },
        __clearDepartmentUsage: (departmentId: string) => {
            for (let index = doctorStore.length - 1; index >= 0; index -= 1) {
                if (doctorStore[index].departmentId === departmentId) {
                    doctorStore.splice(index, 1);
                }
            }

            for (let index = roomStore.length - 1; index >= 0; index -= 1) {
                if (roomStore[index].departmentId === departmentId) {
                    roomStore.splice(index, 1);
                }
            }

            for (let index = nurseStore.length - 1; index >= 0; index -= 1) {
                if (nurseStore[index].departmentId === departmentId) {
                    nurseStore.splice(index, 1);
                }
            }
        },
    };
});

import { createApp } from '../../src/app';

const prismaMock = jest.requireMock('../../src/infrastructure/db/prisma') as {
    __resetDepartments: () => void;
    __seedDoctor: (departmentId: string) => void;
    __seedRoom: (departmentId: string) => void;
    __clearDepartmentUsage: (departmentId: string) => void;
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

describe('Department routes', () => {
    const app = createApp();

    beforeEach(() => {
        prismaMock.__resetDepartments();
        env.jwtAccessSecret = 'test-access-secret';
    });

    it('should reject unauthenticated requests', async () => {
        const response = await request(app).get('/api/departments');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    it('should validate department payload', async () => {
        const token = createAccessToken(['USER']);

        const response = await request(app)
            .post('/api/departments')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Cardiology',
                description: 'Heart department',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Location is required');
    });

    it('should complete the department CRUD flow', async () => {
        const token = createAccessToken(['USER']);

        const createResponse = await request(app)
            .post('/api/departments')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Cardiology',
                location: 'Block A',
                description: 'Heart department',
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.name).toBe('Cardiology');
        expect(createResponse.body.location).toBe('Block A');

        const departmentId = createResponse.body.id as string;

        const listResponse = await request(app)
            .get('/api/departments')
            .set('Authorization', `Bearer ${token}`);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body).toHaveLength(1);
        expect(listResponse.body[0].id).toBe(departmentId);

        const getResponse = await request(app)
            .get(`/api/departments/${departmentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.id).toBe(departmentId);

        const updateResponse = await request(app)
            .put(`/api/departments/${departmentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Neurology',
                location: 'Block B',
                description: 'Brain department',
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.name).toBe('Neurology');
        expect(updateResponse.body.location).toBe('Block B');

        prismaMock.__seedDoctor(departmentId);
        prismaMock.__seedRoom(departmentId);

        const doctorsResponse = await request(app)
            .get(`/api/departments/${departmentId}/doctors`)
            .set('Authorization', `Bearer ${token}`);

        expect(doctorsResponse.status).toBe(200);
        expect(doctorsResponse.body).toHaveLength(1);
        expect(doctorsResponse.body[0].departmentId).toBe(departmentId);

        const roomsResponse = await request(app)
            .get(`/api/departments/${departmentId}/rooms`)
            .set('Authorization', `Bearer ${token}`);

        expect(roomsResponse.status).toBe(200);
        expect(roomsResponse.body).toHaveLength(1);
        expect(roomsResponse.body[0].departmentId).toBe(departmentId);

        const deleteBlockedResponse = await request(app)
            .delete(`/api/departments/${departmentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(deleteBlockedResponse.status).toBe(409);
        expect(deleteBlockedResponse.body.message).toBe(
            'Department cannot be deleted while it is in use',
        );

        prismaMock.__clearDepartmentUsage(departmentId);

        const deleteResponse = await request(app)
            .delete(`/api/departments/${departmentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(deleteResponse.status).toBe(204);

        const getDeletedResponse = await request(app)
            .get(`/api/departments/${departmentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getDeletedResponse.status).toBe(404);
        expect(getDeletedResponse.body.message).toBe('Department not found');
    });
});
