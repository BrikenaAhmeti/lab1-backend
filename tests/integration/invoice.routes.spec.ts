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

    interface MockInvoice {
        id: string;
        patientId: string;
        amount: number;
        invoiceDate: Date;
        status: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }

    const patientStore: MockPatient[] = [];
    const invoiceStore: MockInvoice[] = [];
    let patientCount = 1;
    let invoiceCount = 1;

    function buildInvoiceEntity(invoice: MockInvoice) {
        const patient = patientStore.find((item) => item.id === invoice.patientId);

        if (!patient) {
            throw new Error('Patient not found');
        }

        return {
            ...invoice,
            patient: {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
            },
        };
    }

    function sortInvoices(items: MockInvoice[]) {
        return [...items].sort((left, right) => {
            const invoiceDateResult = right.invoiceDate.getTime()
                - left.invoiceDate.getTime();

            if (invoiceDateResult !== 0) {
                return invoiceDateResult;
            }

            return right.createdAt.getTime() - left.createdAt.getTime();
        });
    }

    function filterInvoices(where?: {
        id?: string;
        patientId?: string;
        status?: string;
    }) {
        return invoiceStore.filter((invoice) => {
            if (where?.id && invoice.id !== where.id) {
                return false;
            }

            if (where?.patientId && invoice.patientId !== where.patientId) {
                return false;
            }

            if (where?.status && invoice.status !== where.status) {
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
            invoice: {
                create: jest.fn(async ({
                    data,
                }: {
                    data: Omit<MockInvoice, 'id' | 'createdAt' | 'updatedAt'>;
                }) => {
                    const now = new Date();
                    const invoice: MockInvoice = {
                        id: `invoice-${invoiceCount}`,
                        ...data,
                        createdAt: now,
                        updatedAt: now,
                    };

                    invoiceCount += 1;
                    invoiceStore.push(invoice);

                    return buildInvoiceEntity(invoice);
                }),
                findMany: jest.fn(async ({
                    where,
                }: {
                    where?: {
                        patientId?: string;
                        status?: string;
                    };
                }) => {
                    return sortInvoices(filterInvoices(where)).map(
                        buildInvoiceEntity,
                    );
                }),
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const invoice = invoiceStore.find((item) => item.id === where.id);

                    return invoice ? buildInvoiceEntity(invoice) : null;
                }),
                update: jest.fn(async ({
                    where,
                    data,
                }: {
                    where: { id: string };
                    data: Partial<MockInvoice>;
                }) => {
                    const invoice = invoiceStore.find((item) => item.id === where.id);

                    if (!invoice) {
                        throw new Error('Invoice not found');
                    }

                    Object.assign(invoice, data, {
                        updatedAt: new Date(),
                    });

                    return buildInvoiceEntity(invoice);
                }),
                aggregate: jest.fn(async ({
                    where,
                }: {
                    where?: { status?: string };
                }) => {
                    const total = invoiceStore
                        .filter((invoice) => {
                            if (where?.status && invoice.status !== where.status) {
                                return false;
                            }

                            return true;
                        })
                        .reduce((sum, invoice) => sum + invoice.amount, 0);

                    return {
                        _sum: {
                            amount: total === 0 ? null : total,
                        },
                    };
                }),
            },
        },
        __resetInvoices: () => {
            patientStore.length = 0;
            invoiceStore.length = 0;
            patientCount = 1;
            invoiceCount = 1;
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
        __seedInvoice: (data: {
            patientId: string;
            amount: number;
            invoiceDate: Date;
            status?: string;
            description?: string | null;
        }) => {
            const now = new Date();
            const invoice: MockInvoice = {
                id: `invoice-${invoiceCount}`,
                patientId: data.patientId,
                amount: data.amount,
                invoiceDate: data.invoiceDate,
                status: data.status ?? 'PENDING',
                description: data.description ?? null,
                createdAt: now,
                updatedAt: now,
            };

            invoiceCount += 1;
            invoiceStore.push(invoice);

            return invoice;
        },
    };
});

import { createApp } from '../../src/app';

const prismaMock = jest.requireMock('../../src/infrastructure/db/prisma') as {
    __resetInvoices: () => void;
    __seedPatient: (overrides?: {
        id?: string;
        firstName?: string;
        lastName?: string;
        isDeleted?: boolean;
    }) => string;
    __seedInvoice: (data: {
        patientId: string;
        amount: number;
        invoiceDate: Date;
        status?: string;
        description?: string | null;
    }) => {
        id: string;
        patientId: string;
        amount: number;
        invoiceDate: Date;
        status: string;
        description: string | null;
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

describe('Invoice routes', () => {
    const app = createApp();

    beforeEach(() => {
        prismaMock.__resetInvoices();
        env.jwtAccessSecret = 'test-access-secret';
    });

    it('should reject unauthenticated requests', async () => {
        const response = await request(app).get('/api/invoices');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    it('should validate invoice payload', async () => {
        const token = createAccessToken(['RECEPTIONIST']);
        const patientId = prismaMock.__seedPatient();

        const response = await request(app)
            .post('/api/invoices')
            .set('Authorization', `Bearer ${token}`)
            .send({
                patient_id: patientId,
                shuma: -10,
                data: '2026-05-07',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Amount must be greater than 0');
    });

    it('should reject invoice creation when patient does not exist', async () => {
        const token = createAccessToken(['RECEPTIONIST']);

        const response = await request(app)
            .post('/api/invoices')
            .set('Authorization', `Bearer ${token}`)
            .send({
                patient_id: 'missing-patient',
                shuma: 120,
                data: '2026-05-07',
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Patient not found');
    });

    it('should complete the invoice flow', async () => {
        const userToken = createAccessToken(['USER']);
        const receptionistToken = createAccessToken(['RECEPTIONIST']);
        const patientId = prismaMock.__seedPatient({
            firstName: 'Ana',
            lastName: 'Berisha',
        });
        const secondPatientId = prismaMock.__seedPatient({
            firstName: 'Dren',
            lastName: 'Krasniqi',
        });

        const forbiddenCreateResponse = await request(app)
            .post('/api/invoices')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                patient_id: patientId,
                shuma: 150.75,
                data: '2026-05-07',
                pershkrimi: 'Room charge',
            });

        expect(forbiddenCreateResponse.status).toBe(403);
        expect(forbiddenCreateResponse.body.message).toBe('Forbidden');

        const createResponse = await request(app)
            .post('/api/invoices')
            .set('Authorization', `Bearer ${receptionistToken}`)
            .send({
                patient_id: patientId,
                shuma: 150.75,
                data: '2026-05-07',
                pershkrimi: ' Room charge ',
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.amount).toBe(150.75);
        expect(createResponse.body.status).toBe('PENDING');
        expect(createResponse.body.description).toBe('Room charge');

        const invoiceId = createResponse.body.id as string;

        const listResponse = await request(app)
            .get(`/api/invoices?patientId=${patientId}&status=PENDING`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body).toHaveLength(1);
        expect(listResponse.body[0].id).toBe(invoiceId);

        const getByIdResponse = await request(app)
            .get(`/api/invoices/${invoiceId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(getByIdResponse.status).toBe(200);
        expect(getByIdResponse.body.patient.id).toBe(patientId);

        const updateResponse = await request(app)
            .put(`/api/invoices/${invoiceId}`)
            .set('Authorization', `Bearer ${receptionistToken}`)
            .send({
                shuma: 180.25,
                pershkrimi: 'Updated room charge',
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.amount).toBe(180.25);
        expect(updateResponse.body.description).toBe('Updated room charge');

        const payResponse = await request(app)
            .put(`/api/invoices/${invoiceId}/pay`)
            .set('Authorization', `Bearer ${receptionistToken}`);

        expect(payResponse.status).toBe(200);
        expect(payResponse.body.status).toBe('PAID');

        const statsResponse = await request(app)
            .get('/api/invoices/stats')
            .set('Authorization', `Bearer ${userToken}`);

        expect(statsResponse.status).toBe(200);
        expect(statsResponse.body).toEqual({
            totalRevenue: 180.25,
        });

        const secondInvoiceResponse = await request(app)
            .post('/api/invoices')
            .set('Authorization', `Bearer ${receptionistToken}`)
            .send({
                patient_id: secondPatientId,
                shuma: 90,
                data: '2026-05-08',
                pershkrimi: 'Lab fee',
            });

        expect(secondInvoiceResponse.status).toBe(201);

        const secondInvoiceId = secondInvoiceResponse.body.id as string;

        const deleteResponse = await request(app)
            .delete(`/api/invoices/${secondInvoiceId}`)
            .set('Authorization', `Bearer ${receptionistToken}`);

        expect(deleteResponse.status).toBe(204);

        const cancelledListResponse = await request(app)
            .get('/api/invoices?status=CANCELLED')
            .set('Authorization', `Bearer ${userToken}`);

        expect(cancelledListResponse.status).toBe(200);
        expect(cancelledListResponse.body).toHaveLength(1);
        expect(cancelledListResponse.body[0].id).toBe(secondInvoiceId);
        expect(cancelledListResponse.body[0].status).toBe('CANCELLED');
    });
});
