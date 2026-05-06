import jwt from 'jsonwebtoken';
import request from 'supertest';
import { env } from '../../src/config/env';

jest.mock('../../src/infrastructure/db/prisma', () => {
    interface MockMedicalRecord {
        id: string;
    }

    interface MockPrescription {
        id: string;
        medicalRecordId: string;
        medicine: string;
        dosage: string;
        duration: string;
        instructions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }

    const medicalRecordStore: MockMedicalRecord[] = [];
    const prescriptionStore: MockPrescription[] = [];
    let medicalRecordCount = 1;
    let prescriptionCount = 1;

    function sortPrescriptions(items: MockPrescription[]) {
        return [...items].sort(
            (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
        );
    }

    return {
        prisma: {
            medicalRecord: {
                findUnique: jest.fn(async ({
                    where,
                    select,
                }: {
                    where: { id: string };
                    select?: { id: boolean };
                }) => {
                    const medicalRecord = medicalRecordStore.find(
                        (item) => item.id === where.id,
                    );

                    if (!medicalRecord) {
                        return null;
                    }

                    if (select?.id) {
                        return {
                            id: medicalRecord.id,
                        };
                    }

                    return medicalRecord;
                }),
            },
            prescription: {
                create: jest.fn(async ({
                    data,
                }: {
                    data: Omit<MockPrescription, 'id' | 'createdAt' | 'updatedAt'>;
                }) => {
                    const now = new Date();
                    const prescription: MockPrescription = {
                        id: `prescription-${prescriptionCount}`,
                        ...data,
                        createdAt: now,
                        updatedAt: now,
                    };

                    prescriptionCount += 1;
                    prescriptionStore.push(prescription);

                    return prescription;
                }),
                findMany: jest.fn(async ({
                    where,
                }: {
                    where?: { medicalRecordId?: string };
                }) => {
                    return sortPrescriptions(
                        prescriptionStore.filter((prescription) => {
                            if (
                                where?.medicalRecordId
                                && prescription.medicalRecordId !== where.medicalRecordId
                            ) {
                                return false;
                            }

                            return true;
                        }),
                    );
                }),
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    return prescriptionStore.find(
                        (item) => item.id === where.id,
                    ) ?? null;
                }),
                update: jest.fn(async ({
                    where,
                    data,
                }: {
                    where: { id: string };
                    data: Partial<MockPrescription>;
                }) => {
                    const prescription = prescriptionStore.find(
                        (item) => item.id === where.id,
                    );

                    if (!prescription) {
                        throw new Error('Prescription not found');
                    }

                    Object.assign(prescription, data, {
                        updatedAt: new Date(),
                    });

                    return prescription;
                }),
                delete: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const index = prescriptionStore.findIndex(
                        (item) => item.id === where.id,
                    );

                    if (index === -1) {
                        throw new Error('Prescription not found');
                    }

                    const [prescription] = prescriptionStore.splice(index, 1);

                    return prescription;
                }),
            },
        },
        __resetPrescriptions: () => {
            medicalRecordStore.length = 0;
            prescriptionStore.length = 0;
            medicalRecordCount = 1;
            prescriptionCount = 1;
        },
        __seedMedicalRecord: () => {
            const medicalRecord: MockMedicalRecord = {
                id: `medical-record-${medicalRecordCount}`,
            };

            medicalRecordCount += 1;
            medicalRecordStore.push(medicalRecord);

            return medicalRecord;
        },
        __seedPrescription: (
            data: Omit<MockPrescription, 'id' | 'createdAt' | 'updatedAt'>,
        ) => {
            const now = new Date();
            const prescription: MockPrescription = {
                id: `prescription-${prescriptionCount}`,
                ...data,
                createdAt: now,
                updatedAt: now,
            };

            prescriptionCount += 1;
            prescriptionStore.push(prescription);

            return prescription;
        },
    };
});

import { createApp } from '../../src/app';

const prismaMock = jest.requireMock('../../src/infrastructure/db/prisma') as {
    __resetPrescriptions: () => void;
    __seedMedicalRecord: () => { id: string };
    __seedPrescription: (data: {
        medicalRecordId: string;
        medicine: string;
        dosage: string;
        duration: string;
        instructions: string | null;
    }) => {
        id: string;
        medicalRecordId: string;
        medicine: string;
        dosage: string;
        duration: string;
        instructions: string | null;
        createdAt: Date;
        updatedAt: Date;
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

describe('Prescription routes', () => {
    const app = createApp();

    beforeEach(() => {
        prismaMock.__resetPrescriptions();
        env.jwtAccessSecret = 'test-access-secret';
    });

    it('should reject unauthenticated requests', async () => {
        const response = await request(app).get(
            '/api/prescriptions?medicalRecordId=x',
        );

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    it('should validate prescription payload', async () => {
        const token = createAccessToken(['DOCTOR']);
        const medicalRecord = prismaMock.__seedMedicalRecord();

        const response = await request(app)
            .post('/api/prescriptions')
            .set('Authorization', `Bearer ${token}`)
            .send({
                medical_record_id: medicalRecord.id,
                dozimi: '500mg',
                kohezgjatja: '5 days',
                udhezime: 'After meals',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Medicine is required');
    });

    it('should reject creation when medical record does not exist', async () => {
        const token = createAccessToken(['DOCTOR']);

        const response = await request(app)
            .post('/api/prescriptions')
            .set('Authorization', `Bearer ${token}`)
            .send({
                medical_record_id: 'missing-record',
                bari: 'Paracetamol',
                dozimi: '500mg',
                kohezgjatja: '5 days',
                udhezime: 'After meals',
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Medical record not found');
    });

    it('should complete the prescription CRUD flow', async () => {
        const userToken = createAccessToken(['USER']);
        const doctorToken = createAccessToken(['DOCTOR']);
        const adminToken = createAccessToken(['ADMIN']);
        const medicalRecord = prismaMock.__seedMedicalRecord();

        prismaMock.__seedPrescription({
            medicalRecordId: medicalRecord.id,
            medicine: 'Ibuprofen',
            dosage: '200mg',
            duration: '3 days',
            instructions: 'After food',
        });

        const forbiddenCreateResponse = await request(app)
            .post('/api/prescriptions')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                medical_record_id: medicalRecord.id,
                bari: 'Paracetamol',
                dozimi: '500mg',
                kohezgjatja: '5 days',
                udhezime: 'After meals',
            });

        expect(forbiddenCreateResponse.status).toBe(403);
        expect(forbiddenCreateResponse.body.message).toBe('Forbidden');

        const createResponse = await request(app)
            .post('/api/prescriptions')
            .set('Authorization', `Bearer ${doctorToken}`)
            .send({
                medical_record_id: medicalRecord.id,
                bari: 'Paracetamol',
                dozimi: '500mg',
                kohezgjatja: '5 days',
                udhezime: 'After meals',
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.medicine).toBe('Paracetamol');
        expect(createResponse.body.medicalRecordId).toBe(medicalRecord.id);

        const prescriptionId = createResponse.body.id as string;

        const listResponse = await request(app)
            .get(`/api/prescriptions?medicalRecordId=${medicalRecord.id}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body).toHaveLength(2);
        expect(listResponse.body[0].id).toBe(prescriptionId);

        const getByIdResponse = await request(app)
            .get(`/api/prescriptions/${prescriptionId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(getByIdResponse.status).toBe(200);
        expect(getByIdResponse.body.id).toBe(prescriptionId);

        const forbiddenUpdateResponse = await request(app)
            .put(`/api/prescriptions/${prescriptionId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                bari: 'Updated medicine',
            });

        expect(forbiddenUpdateResponse.status).toBe(403);
        expect(forbiddenUpdateResponse.body.message).toBe('Forbidden');

        const updateResponse = await request(app)
            .put(`/api/prescriptions/${prescriptionId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                bari: ' Ibuprofen ',
                udhezime: '   ',
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.medicine).toBe('Ibuprofen');
        expect(updateResponse.body.instructions).toBeNull();

        const forbiddenDeleteResponse = await request(app)
            .delete(`/api/prescriptions/${prescriptionId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(forbiddenDeleteResponse.status).toBe(403);
        expect(forbiddenDeleteResponse.body.message).toBe('Forbidden');

        const deleteResponse = await request(app)
            .delete(`/api/prescriptions/${prescriptionId}`)
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(deleteResponse.status).toBe(204);

        const missingResponse = await request(app)
            .get(`/api/prescriptions/${prescriptionId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(missingResponse.status).toBe(404);
        expect(missingResponse.body.message).toBe('Prescription not found');
    });
});
