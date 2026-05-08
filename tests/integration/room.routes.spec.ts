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

    interface MockPatient {
        id: string;
        firstName: string;
        lastName: string;
    }

    interface MockAdmission {
        id: string;
        patientId: string;
        roomId: string;
        status: string;
        admissionDate: Date;
        dischargeDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }

    const departmentStore: MockDepartment[] = [];
    const roomStore: MockRoom[] = [];
    const admissionStore: MockAdmission[] = [];
    const patientStore: MockPatient[] = [];
    let departmentCount = 1;
    let roomCount = 1;
    let admissionCount = 1;
    let patientCount = 1;

    function sortRooms(items: MockRoom[]) {
        return [...items].sort((left, right) => {
            return left.roomNumber.localeCompare(right.roomNumber);
        });
    }

    function buildRoomEntity(room: MockRoom) {
        const department = departmentStore.find(
            (item) => item.id === room.departmentId,
        );

        if (!department) {
            throw new Error('Department not found');
        }

        return {
            ...room,
            department: {
                id: department.id,
                name: department.name,
                location: department.location,
            },
        };
    }

    function buildAdmissionEntity(admission: MockAdmission) {
        const patient = patientStore.find(
            (item) => item.id === admission.patientId,
        );

        if (!patient) {
            throw new Error('Patient not found');
        }

        return {
            ...admission,
            patient: {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
            },
        };
    }

    function filterRooms(where?: {
        id?: string;
        roomNumber?: string;
        departmentId?: string;
        type?: string;
    }) {
        return roomStore.filter((room) => {
            if (where?.id && room.id !== where.id) {
                return false;
            }

            if (where?.roomNumber && room.roomNumber !== where.roomNumber) {
                return false;
            }

            if (where?.departmentId && room.departmentId !== where.departmentId) {
                return false;
            }

            if (where?.type && room.type !== where.type) {
                return false;
            }

            return true;
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
                    return departmentStore.find((item) => item.id === where.id) ?? null;
                }),
            },
            room: {
                create: jest.fn(async ({
                    data,
                }: {
                    data: Omit<MockRoom, 'id' | 'createdAt' | 'updatedAt'>;
                }) => {
                    const now = new Date();
                    const room: MockRoom = {
                        id: `room-${roomCount}`,
                        ...data,
                        createdAt: now,
                        updatedAt: now,
                    };

                    roomCount += 1;
                    roomStore.push(room);

                    return buildRoomEntity(room);
                }),
                findMany: jest.fn(async ({
                    where,
                }: {
                    where?: {
                        departmentId?: string;
                        type?: string;
                    };
                }) => {
                    return sortRooms(filterRooms(where)).map(buildRoomEntity);
                }),
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id?: string; roomNumber?: string };
                }) => {
                    const room = filterRooms(where)[0];

                    return room ? buildRoomEntity(room) : null;
                }),
                update: jest.fn(async ({
                    where,
                    data,
                }: {
                    where: { id: string };
                    data: Partial<MockRoom>;
                }) => {
                    const room = roomStore.find((item) => item.id === where.id);

                    if (!room) {
                        throw new Error('Room not found');
                    }

                    Object.assign(room, data, {
                        updatedAt: new Date(),
                    });

                    return buildRoomEntity(room);
                }),
                delete: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const roomIndex = roomStore.findIndex(
                        (item) => item.id === where.id,
                    );

                    if (roomIndex === -1) {
                        throw new Error('Room not found');
                    }

                    return buildRoomEntity(roomStore.splice(roomIndex, 1)[0]);
                }),
            },
            admission: {
                groupBy: jest.fn(async ({
                    where,
                }: {
                    where: {
                        roomId: {
                            in: string[];
                        };
                        status: string;
                    };
                }) => {
                    return where.roomId.in
                        .map((roomId) => {
                            return {
                                roomId,
                                _count: {
                                    _all: admissionStore.filter((item) => {
                                        return (
                                            item.roomId === roomId
                                            && item.status === where.status
                                        );
                                    }).length,
                                },
                            };
                        })
                        .filter((item) => item._count._all > 0);
                }),
                findMany: jest.fn(async ({
                    where,
                }: {
                    where: {
                        roomId: string;
                        status: string;
                    };
                }) => {
                    return admissionStore
                        .filter((item) => {
                            return (
                                item.roomId === where.roomId
                                && item.status === where.status
                            );
                        })
                        .sort((left, right) => {
                            return right.admissionDate.getTime()
                                - left.admissionDate.getTime();
                        })
                        .map(buildAdmissionEntity);
                }),
            },
        },
        __resetRooms: () => {
            departmentStore.length = 0;
            roomStore.length = 0;
            admissionStore.length = 0;
            patientStore.length = 0;
            departmentCount = 1;
            roomCount = 1;
            admissionCount = 1;
            patientCount = 1;
        },
        __seedDepartment: (overrides?: Partial<MockDepartment>) => {
            const now = new Date();
            const department: MockDepartment = {
                id: overrides?.id ?? `department-${departmentCount}`,
                name: overrides?.name ?? `Department ${departmentCount}`,
                description: overrides?.description ?? null,
                location: overrides?.location ?? 'Block A',
                isActive: overrides?.isActive ?? true,
                createdAt: now,
                updatedAt: now,
            };

            departmentCount += 1;
            departmentStore.push(department);

            return department.id;
        },
        __seedRoom: (data: {
            roomNumber: string;
            departmentId: string;
            type?: string;
            status?: string;
            capacity?: number;
        }) => {
            const now = new Date();
            const room: MockRoom = {
                id: `room-${roomCount}`,
                roomNumber: data.roomNumber,
                departmentId: data.departmentId,
                type: data.type ?? 'GENERAL',
                status: data.status ?? 'AVAILABLE',
                capacity: data.capacity ?? 2,
                createdAt: now,
                updatedAt: now,
            };

            roomCount += 1;
            roomStore.push(room);

            return room.id;
        },
        __seedPatient: (overrides?: Partial<MockPatient>) => {
            const patient: MockPatient = {
                id: overrides?.id ?? `patient-${patientCount}`,
                firstName: overrides?.firstName ?? `Patient${patientCount}`,
                lastName: overrides?.lastName ?? 'Test',
            };

            patientCount += 1;
            patientStore.push(patient);

            return patient.id;
        },
        __seedAdmission: (data: {
            patientId?: string;
            roomId: string;
            status?: string;
            admissionDate?: Date;
        }) => {
            const now = new Date();
            const patientId = data.patientId ?? `patient-${patientCount}`;

            if (!patientStore.some((item) => item.id === patientId)) {
                patientStore.push({
                    id: patientId,
                    firstName: `Patient${patientCount}`,
                    lastName: 'Test',
                });
                patientCount += 1;
            }

            const admission: MockAdmission = {
                id: `admission-${admissionCount}`,
                patientId,
                roomId: data.roomId,
                status: data.status ?? 'ACTIVE',
                admissionDate: data.admissionDate ?? now,
                dischargeDate: null,
                createdAt: now,
                updatedAt: now,
            };

            admissionCount += 1;
            admissionStore.push(admission);

            return admission.id;
        },
    };
});

import { createApp } from '../../src/app';

const prismaMock = jest.requireMock('../../src/infrastructure/db/prisma') as {
    __resetRooms: () => void;
    __seedDepartment: (overrides?: {
        id?: string;
        name?: string;
        description?: string | null;
        location?: string;
        isActive?: boolean;
    }) => string;
    __seedPatient: (overrides?: {
        id?: string;
        firstName?: string;
        lastName?: string;
    }) => string;
    __seedRoom: (data: {
        roomNumber: string;
        departmentId: string;
        type?: string;
        status?: string;
        capacity?: number;
    }) => string;
    __seedAdmission: (data: {
        patientId?: string;
        roomId: string;
        status?: string;
        admissionDate?: Date;
    }) => string;
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

describe('Room routes', () => {
    const app = createApp();
    const adminToken = createAccessToken(['ADMIN']);
    const doctorToken = createAccessToken(['DOCTOR']);

    beforeEach(() => {
        prismaMock.__resetRooms();
    });

    it('should complete the room CRUD flow', async () => {
        const departmentId = prismaMock.__seedDepartment({
            name: 'Intensive Care',
        });

        const createResponse = await request(app)
            .post('/api/rooms')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                roomNumber: '101A',
                departmentId,
                type: 'ICU',
                capacity: 2,
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body).toMatchObject({
            roomNumber: '101A',
            departmentId,
            type: 'ICU',
            status: 'AVAILABLE',
            activeAdmissionsCount: 0,
            availableCapacity: 2,
        });

        const roomId = createResponse.body.id as string;

        const listResponse = await request(app)
            .get(`/api/rooms?departmentId=${departmentId}&type=ICU`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body.data).toHaveLength(1);
        expect(listResponse.body.data[0].id).toBe(roomId);

        const getResponse = await request(app)
            .get(`/api/rooms/${roomId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body).toMatchObject({
            id: roomId,
            currentAdmissions: [],
        });

        const updateResponse = await request(app)
            .put(`/api/rooms/${roomId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                status: 'UNDER_MAINTENANCE',
                capacity: 3,
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body).toMatchObject({
            id: roomId,
            status: 'UNDER_MAINTENANCE',
            capacity: 3,
            availableCapacity: 3,
        });

        const deleteResponse = await request(app)
            .delete(`/api/rooms/${roomId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(deleteResponse.status).toBe(204);

        const finalListResponse = await request(app)
            .get('/api/rooms')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(finalListResponse.status).toBe(200);
        expect(finalListResponse.body.data).toHaveLength(0);
    });

    it('should return only rooms with available capacity', async () => {
        const departmentId = prismaMock.__seedDepartment({
            name: 'Emergency',
            location: 'Block B',
        });
        const availableRoomId = prismaMock.__seedRoom({
            roomNumber: '201',
            departmentId,
            type: 'GENERAL',
            status: 'AVAILABLE',
            capacity: 2,
        });
        const fullRoomId = prismaMock.__seedRoom({
            roomNumber: '202',
            departmentId,
            type: 'ICU',
            status: 'AVAILABLE',
            capacity: 1,
        });

        prismaMock.__seedRoom({
            roomNumber: '203',
            departmentId,
            type: 'SURGERY',
            status: 'UNDER_MAINTENANCE',
            capacity: 2,
        });

        prismaMock.__seedAdmission({
            roomId: availableRoomId,
        });
        prismaMock.__seedAdmission({
            roomId: fullRoomId,
        });

        const availableResponse = await request(app)
            .get('/api/rooms/available')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(availableResponse.status).toBe(200);
        expect(availableResponse.body.data).toHaveLength(1);
        expect(availableResponse.body.data[0]).toMatchObject({
            id: availableRoomId,
            status: 'AVAILABLE',
            activeAdmissionsCount: 1,
            availableCapacity: 1,
        });

        const filteredResponse = await request(app)
            .get(`/api/rooms?departmentId=${departmentId}&type=ICU`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(filteredResponse.status).toBe(200);
        expect(filteredResponse.body.data).toHaveLength(1);
        expect(filteredResponse.body.data[0]).toMatchObject({
            id: fullRoomId,
            status: 'OCCUPIED',
            activeAdmissionsCount: 1,
            availableCapacity: 0,
        });
    });

    it('should return current admissions in the room detail response', async () => {
        const departmentId = prismaMock.__seedDepartment({
            name: 'General Ward',
        });
        const patientId = prismaMock.__seedPatient({
            firstName: 'Lira',
            lastName: 'Gashi',
        });
        const roomId = prismaMock.__seedRoom({
            roomNumber: '401',
            departmentId,
            capacity: 2,
        });

        prismaMock.__seedAdmission({
            patientId,
            roomId,
            admissionDate: new Date('2026-05-06T10:00:00.000Z'),
        });

        const response = await request(app)
            .get(`/api/rooms/${roomId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id: roomId,
            activeAdmissionsCount: 1,
            availableCapacity: 1,
            currentAdmissions: [
                {
                    patientId,
                    status: 'ACTIVE',
                    patient: {
                        firstName: 'Lira',
                        lastName: 'Gashi',
                    },
                },
            ],
        });
    });

    it('should reject room creation for non-admin users', async () => {
        const departmentId = prismaMock.__seedDepartment();

        const response = await request(app)
            .post('/api/rooms')
            .set('Authorization', `Bearer ${doctorToken}`)
            .send({
                roomNumber: '301',
                departmentId,
                type: 'GENERAL',
                capacity: 2,
            });

        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            message: 'Forbidden',
        });
    });
});
