import jwt from 'jsonwebtoken';
import request from 'supertest';
import { env } from '../../src/config/env';

jest.mock('../../src/infrastructure/db/prisma', () => {
    interface MockPatient {
        id: string;
        firstName: string;
        lastName: string;
        isDeleted: boolean;
    }

    interface MockDepartment {
        id: string;
        name: string;
        location: string;
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

    interface MockAdmission {
        id: string;
        patientId: string;
        roomId: string;
        admissionDate: Date;
        dischargeDate: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }

    const patientStore: MockPatient[] = [];
    const departmentStore: MockDepartment[] = [];
    const roomStore: MockRoom[] = [];
    const admissionStore: MockAdmission[] = [];
    let patientCount = 1;
    let departmentCount = 1;
    let roomCount = 1;
    let admissionCount = 1;

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
        const patient = patientStore.find((item) => item.id === admission.patientId);
        const room = roomStore.find((item) => item.id === admission.roomId);

        if (!patient || !room) {
            throw new Error('Related entity not found');
        }

        return {
            ...admission,
            patient: {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
            },
            room: buildRoomEntity(room),
        };
    }

    function filterAdmissions(where?: {
        id?: string;
        patientId?: string;
        roomId?: string;
        status?: string;
    }) {
        return admissionStore.filter((admission) => {
            if (where?.id && admission.id !== where.id) {
                return false;
            }

            if (where?.patientId && admission.patientId !== where.patientId) {
                return false;
            }

            if (where?.roomId && admission.roomId !== where.roomId) {
                return false;
            }

            if (where?.status && admission.status !== where.status) {
                return false;
            }

            return true;
        });
    }

    function sortAdmissions(items: MockAdmission[]) {
        return [...items].sort((left, right) => {
            return right.admissionDate.getTime() - left.admissionDate.getTime();
        });
    }

    return {
        prisma: {
            patient: {
                findFirst: jest.fn(async ({
                    where,
                    select,
                }: {
                    where: { id?: string; isDeleted?: boolean };
                    select?: { id: boolean };
                }) => {
                    const patient = patientStore.find((item) => {
                        if (where.id && item.id !== where.id) {
                            return false;
                        }

                        if (
                            where.isDeleted !== undefined
                            && item.isDeleted !== where.isDeleted
                        ) {
                            return false;
                        }

                        return true;
                    });

                    if (!patient) {
                        return null;
                    }

                    if (select?.id) {
                        return {
                            id: patient.id,
                        };
                    }

                    return patient;
                }),
            },
            room: {
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const room = roomStore.find((item) => item.id === where.id);

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
            },
            admission: {
                create: jest.fn(async ({
                    data,
                }: {
                    data: Omit<MockAdmission, 'id' | 'dischargeDate' | 'createdAt' | 'updatedAt'>;
                }) => {
                    const now = new Date();
                    const admission: MockAdmission = {
                        id: `admission-${admissionCount}`,
                        ...data,
                        dischargeDate: null,
                        createdAt: now,
                        updatedAt: now,
                    };

                    admissionCount += 1;
                    admissionStore.push(admission);

                    return buildAdmissionEntity(admission);
                }),
                findMany: jest.fn(async ({
                    where,
                }: {
                    where?: {
                        status?: string;
                        patientId?: string;
                        roomId?: string;
                    };
                }) => {
                    return sortAdmissions(filterAdmissions(where)).map(
                        buildAdmissionEntity,
                    );
                }),
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const admission = admissionStore.find(
                        (item) => item.id === where.id,
                    );

                    return admission ? buildAdmissionEntity(admission) : null;
                }),
                findFirst: jest.fn(async ({
                    where,
                }: {
                    where: {
                        patientId?: string;
                        status?: string;
                    };
                }) => {
                    return sortAdmissions(filterAdmissions(where)).map(
                        buildAdmissionEntity,
                    )[0] ?? null;
                }),
                count: jest.fn(async ({
                    where,
                }: {
                    where: { roomId: string; status: string };
                }) => {
                    return admissionStore.filter((item) => {
                        return (
                            item.roomId === where.roomId
                            && item.status === where.status
                        );
                    }).length;
                }),
                update: jest.fn(async ({
                    where,
                    data,
                }: {
                    where: { id: string };
                    data: Partial<MockAdmission>;
                }) => {
                    const admission = admissionStore.find(
                        (item) => item.id === where.id,
                    );

                    if (!admission) {
                        throw new Error('Admission not found');
                    }

                    Object.assign(admission, data, {
                        updatedAt: new Date(),
                    });

                    return buildAdmissionEntity(admission);
                }),
            },
        },
        __resetAdmissions: () => {
            patientStore.length = 0;
            departmentStore.length = 0;
            roomStore.length = 0;
            admissionStore.length = 0;
            patientCount = 1;
            departmentCount = 1;
            roomCount = 1;
            admissionCount = 1;
        },
        __seedPatient: (overrides?: Partial<MockPatient>) => {
            const patient: MockPatient = {
                id: overrides?.id ?? `patient-${patientCount}`,
                firstName: overrides?.firstName ?? `Patient${patientCount}`,
                lastName: overrides?.lastName ?? 'Test',
                isDeleted: overrides?.isDeleted ?? false,
            };

            patientCount += 1;
            patientStore.push(patient);

            return patient.id;
        },
        __seedDepartment: (name = 'General Ward', location = 'Block A') => {
            const department: MockDepartment = {
                id: `department-${departmentCount}`,
                name,
                location,
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
        __seedAdmission: (data: {
            patientId: string;
            roomId: string;
            status?: string;
            admissionDate?: Date;
            dischargeDate?: Date | null;
        }) => {
            const now = new Date();
            const admission: MockAdmission = {
                id: `admission-${admissionCount}`,
                patientId: data.patientId,
                roomId: data.roomId,
                status: data.status ?? 'ACTIVE',
                admissionDate: data.admissionDate ?? now,
                dischargeDate: data.dischargeDate ?? null,
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
    __resetAdmissions: () => void;
    __seedPatient: (overrides?: {
        id?: string;
        firstName?: string;
        lastName?: string;
        isDeleted?: boolean;
    }) => string;
    __seedDepartment: (name?: string, location?: string) => string;
    __seedRoom: (data: {
        roomNumber: string;
        departmentId: string;
        type?: string;
        status?: string;
        capacity?: number;
    }) => string;
    __seedAdmission: (data: {
        patientId: string;
        roomId: string;
        status?: string;
        admissionDate?: Date;
        dischargeDate?: Date | null;
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

describe('Admission routes', () => {
    const app = createApp();

    beforeEach(() => {
        prismaMock.__resetAdmissions();
        env.jwtAccessSecret = 'test-access-secret';
    });

    it('should complete the admission and discharge flow', async () => {
        const adminToken = createAccessToken(['ADMIN']);
        const receptionistToken = createAccessToken(['RECEPTIONIST']);
        const departmentId = prismaMock.__seedDepartment('General Ward');
        const patientId = prismaMock.__seedPatient({
            firstName: 'Ana',
            lastName: 'Berisha',
        });
        const roomId = prismaMock.__seedRoom({
            roomNumber: '101',
            departmentId,
            capacity: 1,
        });

        const createResponse = await request(app)
            .post('/api/admissions')
            .set('Authorization', `Bearer ${receptionistToken}`)
            .send({
                patientId,
                roomId,
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body).toMatchObject({
            patientId,
            roomId,
            status: 'ACTIVE',
            room: {
                id: roomId,
                status: 'OCCUPIED',
            },
        });

        const listResponse = await request(app)
            .get('/api/admissions?status=active')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body.data).toHaveLength(1);
        expect(listResponse.body.data[0]).toMatchObject({
            patientId,
            roomId,
            status: 'ACTIVE',
        });

        const activeResponse = await request(app)
            .get('/api/admissions/active')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(activeResponse.status).toBe(200);
        expect(activeResponse.body.data).toHaveLength(1);

        const admissionId = createResponse.body.id as string;
        const dischargeResponse = await request(app)
            .put(`/api/admissions/${admissionId}/discharge`)
            .set('Authorization', `Bearer ${receptionistToken}`)
            .send({});

        expect(dischargeResponse.status).toBe(200);
        expect(dischargeResponse.body).toMatchObject({
            id: admissionId,
            status: 'DISCHARGED',
            room: {
                id: roomId,
                status: 'AVAILABLE',
            },
        });
        expect(dischargeResponse.body.dischargeDate).toBeTruthy();

        const finalActiveResponse = await request(app)
            .get('/api/admissions/active')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(finalActiveResponse.status).toBe(200);
        expect(finalActiveResponse.body.data).toHaveLength(0);
    });

    it('should reject a second active admission for the same patient', async () => {
        const adminToken = createAccessToken(['ADMIN']);
        const departmentId = prismaMock.__seedDepartment('Surgery');
        const patientId = prismaMock.__seedPatient({
            firstName: 'Dren',
            lastName: 'Hoti',
        });
        const firstRoomId = prismaMock.__seedRoom({
            roomNumber: '201',
            departmentId,
            capacity: 2,
        });
        const secondRoomId = prismaMock.__seedRoom({
            roomNumber: '202',
            departmentId,
            capacity: 2,
        });

        const firstResponse = await request(app)
            .post('/api/admissions')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                patientId,
                roomId: firstRoomId,
            });

        expect(firstResponse.status).toBe(201);

        const secondResponse = await request(app)
            .post('/api/admissions')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                patientId,
                roomId: secondRoomId,
            });

        expect(secondResponse.status).toBe(409);
        expect(secondResponse.body.message).toBe('Patient is already admitted');
        expect(secondResponse.body.success).toBe(false);
        expect(secondResponse.body.statusCode).toBe(409);
    });

    it('should reject admission when the room is full', async () => {
        const adminToken = createAccessToken(['ADMIN']);
        const departmentId = prismaMock.__seedDepartment('Emergency');
        const firstPatientId = prismaMock.__seedPatient({
            firstName: 'Arta',
            lastName: 'Kelmendi',
        });
        const secondPatientId = prismaMock.__seedPatient({
            firstName: 'Besa',
            lastName: 'Rexha',
        });
        const roomId = prismaMock.__seedRoom({
            roomNumber: '301',
            departmentId,
            capacity: 1,
        });

        prismaMock.__seedAdmission({
            patientId: firstPatientId,
            roomId,
            status: 'ACTIVE',
        });

        const response = await request(app)
            .post('/api/admissions')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                patientId: secondPatientId,
                roomId,
            });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe('Room has no available capacity');
        expect(response.body.success).toBe(false);
        expect(response.body.statusCode).toBe(409);
    });

    it('should reject admission creation for unauthorized roles', async () => {
        const doctorToken = createAccessToken(['DOCTOR']);
        const departmentId = prismaMock.__seedDepartment('ICU');
        const patientId = prismaMock.__seedPatient();
        const roomId = prismaMock.__seedRoom({
            roomNumber: '401',
            departmentId,
            capacity: 2,
        });

        const response = await request(app)
            .post('/api/admissions')
            .set('Authorization', `Bearer ${doctorToken}`)
            .send({
                patientId,
                roomId,
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Forbidden');
        expect(response.body.success).toBe(false);
        expect(response.body.statusCode).toBe(403);
    });
});
