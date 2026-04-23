import jwt from 'jsonwebtoken';
import request from 'supertest';
import { env } from '../../src/config/env';

jest.mock('../../src/infrastructure/db/prisma', () => {
    interface MockPatient {
        id: string;
        firstName: string;
        lastName: string;
        dateOfBirth: Date;
        gender: string;
        phoneNumber: string;
        address: string;
        bloodType: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }

    const patientStore: MockPatient[] = [];
    let patientCount = 1;

    function getSearchValue(where?: {
        OR?: Array<{
            firstName?: { contains?: string };
            lastName?: { contains?: string };
        }>;
    }) {
        return where?.OR?.[0]?.firstName?.contains
            ?? where?.OR?.[1]?.lastName?.contains;
    }

    function filterPatients(where?: {
        id?: string;
        isDeleted?: boolean;
        OR?: Array<{
            firstName?: { contains?: string };
            lastName?: { contains?: string };
        }>;
    }) {
        const search = getSearchValue(where)?.toLowerCase();

        return patientStore.filter((patient) => {
            if (where?.id && patient.id !== where.id) {
                return false;
            }

            if (where?.isDeleted !== undefined && patient.isDeleted !== where.isDeleted) {
                return false;
            }

            if (!search) {
                return true;
            }

            return patient.firstName.toLowerCase().includes(search)
                || patient.lastName.toLowerCase().includes(search);
        });
    }

    return {
        prisma: {
            patient: {
                create: jest.fn(async ({ data }: { data: Omit<MockPatient, 'id' | 'isDeleted' | 'createdAt' | 'updatedAt'> }) => {
                    const now = new Date();
                    const patient: MockPatient = {
                        id: `patient-${patientCount}`,
                        ...data,
                        isDeleted: false,
                        createdAt: now,
                        updatedAt: now,
                    };

                    patientCount += 1;
                    patientStore.push(patient);

                    return patient;
                }),
                findFirst: jest.fn(async ({ where }: { where: { id?: string; isDeleted?: boolean } }) => {
                    return filterPatients(where)[0] ?? null;
                }),
                findMany: jest.fn(async ({
                    where,
                    skip = 0,
                    take,
                }: {
                    where?: {
                        isDeleted?: boolean;
                        OR?: Array<{
                            firstName?: { contains?: string };
                            lastName?: { contains?: string };
                        }>;
                    };
                    skip?: number;
                    take?: number;
                }) => {
                    const patients = filterPatients(where).sort(
                        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
                    );

                    if (take === undefined) {
                        return patients.slice(skip);
                    }

                    return patients.slice(skip, skip + take);
                }),
                count: jest.fn(async ({ where }: {
                    where?: {
                        isDeleted?: boolean;
                        OR?: Array<{
                            firstName?: { contains?: string };
                            lastName?: { contains?: string };
                        }>;
                    };
                }) => {
                    return filterPatients(where).length;
                }),
                update: jest.fn(async ({
                    where,
                    data,
                }: {
                    where: { id: string };
                    data: Partial<MockPatient>;
                }) => {
                    const patient = patientStore.find((item) => item.id === where.id);

                    if (!patient) {
                        throw new Error('Patient not found');
                    }

                    Object.assign(patient, data, {
                        updatedAt: new Date(),
                    });

                    return patient;
                }),
            },
        },
        __resetPatients: () => {
            patientStore.length = 0;
            patientCount = 1;
        },
    };
});

import { createApp } from '../../src/app';

const prismaMock = jest.requireMock('../../src/infrastructure/db/prisma') as {
    __resetPatients: () => void;
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

describe('Patient routes', () => {
    const app = createApp();

    beforeEach(() => {
        prismaMock.__resetPatients();
        env.jwtAccessSecret = 'test-access-secret';
    });

    it('should reject unauthenticated requests', async () => {
        const response = await request(app).get('/api/patients');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    it('should validate patient payload', async () => {
        const token = createAccessToken(['USER']);

        const response = await request(app)
            .post('/api/patients')
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'Ana',
                lastName: 'Krasniqi',
                dateOfBirth: '1998-03-10',
                gender: 'FEMALE',
                phoneNumber: 'invalid-phone',
                address: 'Prishtine',
                bloodType: 'A+',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('phoneNumber format is invalid');
    });

    it('should complete the patient CRUD flow', async () => {
        const userToken = createAccessToken(['USER']);
        const adminToken = createAccessToken(['ADMIN']);

        const createResponse = await request(app)
            .post('/api/patients')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                firstName: 'Ana',
                lastName: 'Krasniqi',
                dateOfBirth: '1998-03-10',
                gender: 'FEMALE',
                phoneNumber: '+38344111222',
                address: 'Prishtine',
                bloodType: 'A+',
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.firstName).toBe('Ana');

        const patientId = createResponse.body.id as string;

        const listResponse = await request(app)
            .get('/api/patients?page=1&limit=10&search=ana')
            .set('Authorization', `Bearer ${userToken}`);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body.items).toHaveLength(1);
        expect(listResponse.body.total).toBe(1);
        expect(listResponse.body.page).toBe(1);
        expect(listResponse.body.limit).toBe(10);

        const getResponse = await request(app)
            .get(`/api/patients/${patientId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.id).toBe(patientId);

        const updateResponse = await request(app)
            .put(`/api/patients/${patientId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                address: 'Peje',
                phoneNumber: '+38344123456',
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.address).toBe('Peje');
        expect(updateResponse.body.phoneNumber).toBe('+38344123456');

        const forbiddenDeleteResponse = await request(app)
            .delete(`/api/patients/${patientId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(forbiddenDeleteResponse.status).toBe(403);
        expect(forbiddenDeleteResponse.body.message).toBe('Forbidden');

        const deleteResponse = await request(app)
            .delete(`/api/patients/${patientId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(deleteResponse.status).toBe(204);

        const getDeletedResponse = await request(app)
            .get(`/api/patients/${patientId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(getDeletedResponse.status).toBe(404);
        expect(getDeletedResponse.body.message).toBe('Patient not found');
    });
});
