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

    interface MockAppointment {
        id: string;
        patientId: string;
        doctorId: string;
        appointmentDate: Date;
        appointmentTime: string;
        status: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }

    const patientStore: MockPatient[] = [];
    const doctorStore: MockDoctor[] = [];
    const appointmentStore: MockAppointment[] = [];
    let patientCount = 1;
    let doctorCount = 1;
    let appointmentCount = 1;

    function sameDate(left: Date, right: Date) {
        return left.getTime() === right.getTime();
    }

    function buildAppointmentEntity(appointment: MockAppointment) {
        const patient = patientStore.find((item) => item.id === appointment.patientId);
        const doctor = doctorStore.find((item) => item.id === appointment.doctorId);

        if (!patient || !doctor) {
            throw new Error('Related entity not found');
        }

        return {
            ...appointment,
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

    function sortAppointments(items: MockAppointment[]) {
        return [...items].sort((left, right) => {
            const dateResult = left.appointmentDate.getTime()
                - right.appointmentDate.getTime();

            if (dateResult !== 0) {
                return dateResult;
            }

            return left.appointmentTime.localeCompare(right.appointmentTime);
        });
    }

    function filterAppointments(where?: {
        id?: string;
        doctorId?: string;
        patientId?: string;
        appointmentDate?: Date;
        appointmentTime?: string;
        status?: string | { not: string };
    }) {
        return appointmentStore.filter((appointment) => {
            if (where?.id && appointment.id !== where.id) {
                return false;
            }

            if (where?.doctorId && appointment.doctorId !== where.doctorId) {
                return false;
            }

            if (where?.patientId && appointment.patientId !== where.patientId) {
                return false;
            }

            if (
                where?.appointmentDate
                && !sameDate(appointment.appointmentDate, where.appointmentDate)
            ) {
                return false;
            }

            if (
                where?.appointmentTime
                && appointment.appointmentTime !== where.appointmentTime
            ) {
                return false;
            }

            if (typeof where?.status === 'string' && appointment.status !== where.status) {
                return false;
            }

            if (
                typeof where?.status === 'object'
                && appointment.status === where.status.not
            ) {
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
            appointment: {
                create: jest.fn(async ({
                    data,
                }: {
                    data: Omit<MockAppointment, 'id' | 'createdAt' | 'updatedAt'>;
                }) => {
                    const now = new Date();
                    const appointment: MockAppointment = {
                        id: `appointment-${appointmentCount}`,
                        ...data,
                        createdAt: now,
                        updatedAt: now,
                    };

                    appointmentCount += 1;
                    appointmentStore.push(appointment);

                    return buildAppointmentEntity(appointment);
                }),
                findMany: jest.fn(async ({
                    where,
                }: {
                    where?: {
                        doctorId?: string;
                        patientId?: string;
                        appointmentDate?: Date;
                        status?: string;
                    };
                }) => {
                    return sortAppointments(filterAppointments(where)).map(
                        buildAppointmentEntity,
                    );
                }),
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const appointment = appointmentStore.find(
                        (item) => item.id === where.id,
                    );

                    return appointment ? buildAppointmentEntity(appointment) : null;
                }),
                findFirst: jest.fn(async ({
                    where,
                }: {
                    where: {
                        doctorId?: string;
                        appointmentDate?: Date;
                        appointmentTime?: string;
                        status?: { not: string };
                        id?: { not: string };
                    };
                }) => {
                    return filterAppointments({
                        doctorId: where.doctorId,
                        appointmentDate: where.appointmentDate,
                        appointmentTime: where.appointmentTime,
                        status: where.status,
                    })
                        .filter((appointment) => {
                            if (where.id?.not && appointment.id === where.id.not) {
                                return false;
                            }

                            return true;
                        })
                        .map(buildAppointmentEntity)[0] ?? null;
                }),
                update: jest.fn(async ({
                    where,
                    data,
                }: {
                    where: { id: string };
                    data: Partial<MockAppointment>;
                }) => {
                    const appointment = appointmentStore.find(
                        (item) => item.id === where.id,
                    );

                    if (!appointment) {
                        throw new Error('Appointment not found');
                    }

                    Object.assign(appointment, data, {
                        updatedAt: new Date(),
                    });

                    return buildAppointmentEntity(appointment);
                }),
            },
        },
        __resetAppointments: () => {
            patientStore.length = 0;
            doctorStore.length = 0;
            appointmentStore.length = 0;
            patientCount = 1;
            doctorCount = 1;
            appointmentCount = 1;
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
        __seedAppointment: (
            data: Omit<MockAppointment, 'id' | 'createdAt' | 'updatedAt'>,
        ) => {
            const now = new Date();
            const appointment: MockAppointment = {
                id: `appointment-${appointmentCount}`,
                ...data,
                createdAt: now,
                updatedAt: now,
            };

            appointmentCount += 1;
            appointmentStore.push(appointment);

            return appointment;
        },
    };
});

import { createApp } from '../../src/app';

const prismaMock = jest.requireMock('../../src/infrastructure/db/prisma') as {
    __resetAppointments: () => void;
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
    __seedAppointment: (data: {
        patientId: string;
        doctorId: string;
        appointmentDate: Date;
        appointmentTime: string;
        status: string;
        notes: string | null;
    }) => {
        id: string;
        patientId: string;
        doctorId: string;
        appointmentDate: Date;
        appointmentTime: string;
        status: string;
        notes: string | null;
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

function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

function addDays(baseDate: Date, days: number) {
    const nextDate = new Date(baseDate);

    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
}

describe('Appointment routes', () => {
    const app = createApp();

    beforeEach(() => {
        prismaMock.__resetAppointments();
        env.jwtAccessSecret = 'test-access-secret';
    });

    it('should reject unauthenticated requests', async () => {
        const response = await request(app).get('/api/appointments');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    it('should validate appointment payload', async () => {
        const token = createAccessToken(['USER']);
        const patient = prismaMock.__seedPatient('Ana', 'Krasniqi');
        const doctor = prismaMock.__seedDoctor('Arben', 'Hoxha', 'Cardiology');
        const tomorrow = formatDate(addDays(new Date(), 1));

        const response = await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${token}`)
            .send({
                patientId: patient.id,
                doctorId: doctor.id,
                date: tomorrow,
                time: 'invalid-time',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Time must be in HH:mm format');
    });

    it('should complete the appointment CRUD flow with conflict checks', async () => {
        const token = createAccessToken(['USER']);
        const today = new Date();
        const todayDate = formatDate(today);
        const tomorrow = formatDate(addDays(today, 1));
        const dayAfterTomorrow = formatDate(addDays(today, 2));
        const twoDaysAfterTomorrow = formatDate(addDays(today, 3));
        const patientOne = prismaMock.__seedPatient('Ana', 'Krasniqi');
        const patientTwo = prismaMock.__seedPatient('Besa', 'Hoti');
        const doctor = prismaMock.__seedDoctor('Arben', 'Hoxha', 'Cardiology');
        prismaMock.__seedAppointment({
            patientId: patientTwo.id,
            doctorId: doctor.id,
            appointmentDate: new Date(`${todayDate}T00:00:00.000Z`),
            appointmentTime: '16:00',
            status: 'Scheduled',
            notes: 'Dashboard appointment',
        });

        const createResponse = await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${token}`)
            .send({
                patientId: patientOne.id,
                doctorId: doctor.id,
                date: tomorrow,
                time: '14:30',
                notes: 'Routine check',
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.status).toBe('Scheduled');
        expect(createResponse.body.patient.firstName).toBe('Ana');

        const appointmentId = createResponse.body.id as string;

        const conflictResponse = await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${token}`)
            .send({
                patientId: patientTwo.id,
                doctorId: doctor.id,
                date: tomorrow,
                time: '14:30',
            });

        expect(conflictResponse.status).toBe(409);
        expect(conflictResponse.body.message).toBe(
            'Doctor already has an appointment at this date and time',
        );

        const listResponse = await request(app)
            .get(
                `/api/appointments?page=1&limit=10&sortBy=date&order=ASC&doctorId=${doctor.id}&status=Scheduled&from=${tomorrow}&to=${dayAfterTomorrow}`,
            )
            .set('Authorization', `Bearer ${token}`);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body.data).toHaveLength(1);
        expect(listResponse.body.data[0].id).toBe(appointmentId);

        const todayResponse = await request(app)
            .get('/api/appointments/today')
            .set('Authorization', `Bearer ${token}`);

        expect(todayResponse.status).toBe(200);
        expect(todayResponse.body.data).toHaveLength(1);

        const getByIdResponse = await request(app)
            .get(`/api/appointments/${appointmentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getByIdResponse.status).toBe(200);
        expect(getByIdResponse.body.id).toBe(appointmentId);

        const updateResponse = await request(app)
            .put(`/api/appointments/${appointmentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                date: dayAfterTomorrow,
                time: '11:00',
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.appointmentTime).toBe('11:00');

        const completeResponse = await request(app)
            .put(`/api/appointments/${appointmentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                status: 'Completed',
            });

        expect(completeResponse.status).toBe(200);
        expect(completeResponse.body.status).toBe('Completed');

        const deleteCompletedResponse = await request(app)
            .delete(`/api/appointments/${appointmentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(deleteCompletedResponse.status).toBe(400);
        expect(deleteCompletedResponse.body.message).toBe(
            'Completed appointment cannot be cancelled',
        );

        const secondAppointmentResponse = await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${token}`)
            .send({
                patientId: patientTwo.id,
                doctorId: doctor.id,
                date: twoDaysAfterTomorrow,
                time: '09:00',
            });

        expect(secondAppointmentResponse.status).toBe(201);

        const secondAppointmentId = secondAppointmentResponse.body.id as string;

        const cancelResponse = await request(app)
            .delete(`/api/appointments/${secondAppointmentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(cancelResponse.status).toBe(204);

        const recreateCancelledSlotResponse = await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${token}`)
            .send({
                patientId: patientOne.id,
                doctorId: doctor.id,
                date: twoDaysAfterTomorrow,
                time: '09:00',
            });

        expect(recreateCancelledSlotResponse.status).toBe(201);

        const cancelledListResponse = await request(app)
            .get('/api/appointments?status=Cancelled')
            .set('Authorization', `Bearer ${token}`);

        expect(cancelledListResponse.status).toBe(200);
        expect(cancelledListResponse.body.data).toHaveLength(1);
        expect(cancelledListResponse.body.data[0].id).toBe(secondAppointmentId);
    });

    it('should reject appointment creation in the past', async () => {
        const token = createAccessToken(['USER']);
        const patient = prismaMock.__seedPatient('Ana', 'Krasniqi');
        const doctor = prismaMock.__seedDoctor('Arben', 'Hoxha', 'Cardiology');
        const yesterday = formatDate(addDays(new Date(), -1));

        const response = await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${token}`)
            .send({
                patientId: patient.id,
                doctorId: doctor.id,
                date: yesterday,
                time: '10:00',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Appointment date cannot be in the past');
    });
});
