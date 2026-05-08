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

    interface MockDoctor {
        id: string;
        firstName: string;
        lastName: string;
        specialization: string;
    }

    interface MockMedicalRecord {
        id: string;
        patientId: string;
        doctorId: string;
        diagnosis: string;
        treatment: string;
        prescriptionsText: string | null;
        recordDate: Date;
        createdAt: Date;
        updatedAt: Date;
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

    const patientStore: MockPatient[] = [];
    const doctorStore: MockDoctor[] = [];
    const medicalRecordStore: MockMedicalRecord[] = [];
    const prescriptionStore: MockPrescription[] = [];
    let patientCount = 1;
    let doctorCount = 1;
    let medicalRecordCount = 1;
    let prescriptionCount = 1;

    function buildMedicalRecordEntity(medicalRecord: MockMedicalRecord) {
        const patient = patientStore.find((item) => item.id === medicalRecord.patientId);
        const doctor = doctorStore.find((item) => item.id === medicalRecord.doctorId);

        if (!patient || !doctor) {
            throw new Error('Related entity not found');
        }

        return {
            ...medicalRecord,
            patient: {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
            },
            doctor: {
                id: doctor.id,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization,
            },
        };
    }

    function sortMedicalRecords(items: MockMedicalRecord[]) {
        return [...items].sort((left, right) => {
            const recordDateResult = right.recordDate.getTime()
                - left.recordDate.getTime();

            if (recordDateResult !== 0) {
                return recordDateResult;
            }

            return right.createdAt.getTime() - left.createdAt.getTime();
        });
    }

    function sortPrescriptions(items: MockPrescription[]) {
        return [...items].sort(
            (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
        );
    }

    function filterMedicalRecords(where?: {
        id?: string;
        patientId?: string;
    }) {
        return medicalRecordStore.filter((medicalRecord) => {
            if (where?.id && medicalRecord.id !== where.id) {
                return false;
            }

            if (where?.patientId && medicalRecord.patientId !== where.patientId) {
                return false;
            }

            return true;
        });
    }

    return {
        prisma: {
            patient: {
                findFirst: jest.fn(async ({
                    where,
                }: {
                    where: { id?: string; isDeleted?: boolean };
                }) => {
                    return patientStore.find((patient) => {
                        if (where.id && patient.id !== where.id) {
                            return false;
                        }

                        if (
                            where.isDeleted !== undefined
                            && patient.isDeleted !== where.isDeleted
                        ) {
                            return false;
                        }

                        return true;
                    }) ?? null;
                }),
            },
            doctor: {
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    return doctorStore.find((doctor) => doctor.id === where.id) ?? null;
                }),
            },
            medicalRecord: {
                create: jest.fn(async ({
                    data,
                }: {
                    data: Omit<MockMedicalRecord, 'id' | 'createdAt' | 'updatedAt'>;
                }) => {
                    const now = new Date();
                    const medicalRecord: MockMedicalRecord = {
                        id: `medical-record-${medicalRecordCount}`,
                        ...data,
                        createdAt: now,
                        updatedAt: now,
                    };

                    medicalRecordCount += 1;
                    medicalRecordStore.push(medicalRecord);

                    return buildMedicalRecordEntity(medicalRecord);
                }),
                findMany: jest.fn(async ({
                    where,
                }: {
                    where?: { patientId?: string };
                }) => {
                    return sortMedicalRecords(filterMedicalRecords(where)).map(
                        buildMedicalRecordEntity,
                    );
                }),
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const medicalRecord = medicalRecordStore.find(
                        (item) => item.id === where.id,
                    );

                    return medicalRecord ? buildMedicalRecordEntity(medicalRecord) : null;
                }),
                update: jest.fn(async ({
                    where,
                    data,
                }: {
                    where: { id: string };
                    data: Partial<MockMedicalRecord>;
                }) => {
                    const medicalRecord = medicalRecordStore.find(
                        (item) => item.id === where.id,
                    );

                    if (!medicalRecord) {
                        throw new Error('Medical record not found');
                    }

                    Object.assign(medicalRecord, data, {
                        updatedAt: new Date(),
                    });

                    return buildMedicalRecordEntity(medicalRecord);
                }),
                delete: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const index = medicalRecordStore.findIndex(
                        (item) => item.id === where.id,
                    );

                    if (index === -1) {
                        throw new Error('Medical record not found');
                    }

                    const [medicalRecord] = medicalRecordStore.splice(index, 1);

                    for (let i = prescriptionStore.length - 1; i >= 0; i -= 1) {
                        if (prescriptionStore[i].medicalRecordId === medicalRecord.id) {
                            prescriptionStore.splice(i, 1);
                        }
                    }

                    return buildMedicalRecordEntity(medicalRecord);
                }),
            },
            prescription: {
                findMany: jest.fn(async ({
                    where,
                }: {
                    where: { medicalRecordId: string };
                }) => {
                    return sortPrescriptions(
                        prescriptionStore.filter(
                            (prescription) => (
                                prescription.medicalRecordId === where.medicalRecordId
                            ),
                        ),
                    );
                }),
            },
        },
        __resetMedicalRecords: () => {
            patientStore.length = 0;
            doctorStore.length = 0;
            medicalRecordStore.length = 0;
            prescriptionStore.length = 0;
            patientCount = 1;
            doctorCount = 1;
            medicalRecordCount = 1;
            prescriptionCount = 1;
        },
        __seedPatient: (firstName: string, lastName: string) => {
            const patient: MockPatient = {
                id: `patient-${patientCount}`,
                firstName,
                lastName,
                isDeleted: false,
            };

            patientCount += 1;
            patientStore.push(patient);

            return patient;
        },
        __seedDoctor: (
            firstName: string,
            lastName: string,
            specialization: string,
        ) => {
            const doctor: MockDoctor = {
                id: `doctor-${doctorCount}`,
                firstName,
                lastName,
                specialization,
            };

            doctorCount += 1;
            doctorStore.push(doctor);

            return doctor;
        },
        __seedMedicalRecord: (
            data: Omit<MockMedicalRecord, 'id' | 'createdAt' | 'updatedAt'>,
        ) => {
            const now = new Date();
            const medicalRecord: MockMedicalRecord = {
                id: `medical-record-${medicalRecordCount}`,
                ...data,
                createdAt: now,
                updatedAt: now,
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
    __resetMedicalRecords: () => void;
    __seedPatient: (
        firstName: string,
        lastName: string,
    ) => {
        id: string;
        firstName: string;
        lastName: string;
    };
    __seedDoctor: (
        firstName: string,
        lastName: string,
        specialization: string,
    ) => {
        id: string;
        firstName: string;
        lastName: string;
        specialization: string;
    };
    __seedMedicalRecord: (data: {
        patientId: string;
        doctorId: string;
        diagnosis: string;
        treatment: string;
        prescriptionsText: string | null;
        recordDate: Date;
    }) => {
        id: string;
        patientId: string;
        doctorId: string;
        diagnosis: string;
        treatment: string;
        prescriptionsText: string | null;
        recordDate: Date;
        createdAt: Date;
        updatedAt: Date;
    };
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

describe('Medical record routes', () => {
    const app = createApp();

    beforeEach(() => {
        prismaMock.__resetMedicalRecords();
        env.jwtAccessSecret = 'test-access-secret';
    });

    it('should reject unauthenticated requests', async () => {
        const response = await request(app).get('/api/medical-records?patientId=x');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    it('should validate medical record payload', async () => {
        const token = createAccessToken(['DOCTOR']);
        const patient = prismaMock.__seedPatient('Ana', 'Krasniqi');
        const doctor = prismaMock.__seedDoctor('Arben', 'Hoxha', 'Cardiology');

        const response = await request(app)
            .post('/api/medical-records')
            .set('Authorization', `Bearer ${token}`)
            .send({
                patient_id: patient.id,
                doctor_id: doctor.id,
                trajtimi: 'Rest',
                recetat: 'Tea',
                data: '2026-05-01',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Diagnosis is required');
    });

    it('should complete the medical record CRUD flow', async () => {
        const userToken = createAccessToken(['USER']);
        const doctorToken = createAccessToken(['DOCTOR']);
        const adminToken = createAccessToken(['ADMIN']);
        const patient = prismaMock.__seedPatient('Ana', 'Krasniqi');
        const doctor = prismaMock.__seedDoctor('Arben', 'Hoxha', 'Cardiology');

        prismaMock.__seedMedicalRecord({
            patientId: patient.id,
            doctorId: doctor.id,
            diagnosis: 'Older diagnosis',
            treatment: 'Older treatment',
            prescriptionsText: 'Older prescription',
            recordDate: new Date('2026-04-20T00:00:00.000Z'),
        });

        const forbiddenCreateResponse = await request(app)
            .post('/api/medical-records')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                patient_id: patient.id,
                doctor_id: doctor.id,
                diagnoza: 'Flu',
                trajtimi: 'Rest',
                recetat: 'Vitamin C',
                data: '2026-05-02',
            });

        expect(forbiddenCreateResponse.status).toBe(403);
        expect(forbiddenCreateResponse.body.message).toBe('Forbidden');

        const createResponse = await request(app)
            .post('/api/medical-records')
            .set('Authorization', `Bearer ${doctorToken}`)
            .send({
                patient_id: patient.id,
                doctor_id: doctor.id,
                diagnoza: 'Flu',
                trajtimi: 'Rest and hydration',
                recetat: 'Vitamin C',
                data: '2026-05-02',
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.diagnosis).toBe('Flu');
        expect(createResponse.body.patient.firstName).toBe('Ana');

        const medicalRecordId = createResponse.body.id as string;

        const listResponse = await request(app)
            .get(`/api/medical-records?patientId=${patient.id}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body.data).toHaveLength(2);
        expect(listResponse.body.data[0].id).toBe(medicalRecordId);

        const getByIdResponse = await request(app)
            .get(`/api/medical-records/${medicalRecordId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(getByIdResponse.status).toBe(200);
        expect(getByIdResponse.body.id).toBe(medicalRecordId);

        const forbiddenUpdateResponse = await request(app)
            .put(`/api/medical-records/${medicalRecordId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                treatment: 'Updated treatment',
            });

        expect(forbiddenUpdateResponse.status).toBe(403);
        expect(forbiddenUpdateResponse.body.message).toBe('Forbidden');

        const updateResponse = await request(app)
            .put(`/api/medical-records/${medicalRecordId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                treatment: ' Updated treatment ',
                recetat: null,
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.treatment).toBe('Updated treatment');
        expect(updateResponse.body.prescriptionsText).toBeNull();

        prismaMock.__seedPrescription({
            medicalRecordId,
            medicine: 'Ibuprofen',
            dosage: '200mg',
            duration: '3 days',
            instructions: 'After food',
        });
        prismaMock.__seedPrescription({
            medicalRecordId,
            medicine: 'Vitamin C',
            dosage: '1000mg',
            duration: '7 days',
            instructions: 'Morning',
        });

        const prescriptionsResponse = await request(app)
            .get(`/api/medical-records/${medicalRecordId}/prescriptions`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(prescriptionsResponse.status).toBe(200);
        expect(prescriptionsResponse.body).toHaveLength(2);
        expect(prescriptionsResponse.body[0].medicalRecordId).toBe(medicalRecordId);

        const deleteResponse = await request(app)
            .delete(`/api/medical-records/${medicalRecordId}`)
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(deleteResponse.status).toBe(204);

        const getDeletedResponse = await request(app)
            .get(`/api/medical-records/${medicalRecordId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(getDeletedResponse.status).toBe(404);
        expect(getDeletedResponse.body.message).toBe('Medical record not found');
    });
});
