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

    interface MockInvoice {
        id: string;
        patientId: string;
        amount: number;
        status: string;
    }

    const patientStore: MockPatient[] = [];
    const doctorStore: MockDoctor[] = [];
    const departmentStore: MockDepartment[] = [];
    const roomStore: MockRoom[] = [];
    const appointmentStore: MockAppointment[] = [];
    const admissionStore: MockAdmission[] = [];
    const invoiceStore: MockInvoice[] = [];
    let patientCount = 1;
    let doctorCount = 1;
    let departmentCount = 1;
    let roomCount = 1;
    let appointmentCount = 1;
    let admissionCount = 1;
    let invoiceCount = 1;

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

    function sortAdmissions(items: MockAdmission[]) {
        return [...items].sort((left, right) => {
            return right.admissionDate.getTime() - left.admissionDate.getTime();
        });
    }

    return {
        prisma: {
            patient: {
                count: jest.fn(async ({
                    where,
                }: {
                    where?: { isDeleted?: boolean };
                }) => {
                    return patientStore.filter((patient) => {
                        if (
                            where?.isDeleted !== undefined
                            && patient.isDeleted !== where.isDeleted
                        ) {
                            return false;
                        }

                        return true;
                    }).length;
                }),
            },
            department: {
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    return departmentStore.find((item) => item.id === where.id) ?? null;
                }),
            },
            doctor: {
                count: jest.fn(async () => doctorStore.length),
            },
            room: {
                count: jest.fn(async ({
                    where,
                }: {
                    where?: { status?: string };
                }) => {
                    return roomStore.filter((room) => {
                        if (where?.status && room.status !== where.status) {
                            return false;
                        }

                        return true;
                    }).length;
                }),
                findMany: jest.fn(async ({
                    where,
                }: {
                    where?: { departmentId?: string; type?: string };
                }) => {
                    return roomStore
                        .filter((room) => {
                            if (where?.departmentId && room.departmentId !== where.departmentId) {
                                return false;
                            }

                            if (where?.type && room.type !== where.type) {
                                return false;
                            }

                            return true;
                        })
                        .sort((left, right) => {
                            return left.roomNumber.localeCompare(right.roomNumber);
                        })
                        .map(buildRoomEntity);
                }),
            },
            appointment: {
                count: jest.fn(async ({
                    where,
                }: {
                    where?: { appointmentDate?: Date };
                }) => {
                    return appointmentStore.filter((appointment) => {
                        if (
                            where?.appointmentDate
                            && !sameDate(appointment.appointmentDate, where.appointmentDate)
                        ) {
                            return false;
                        }

                        return true;
                    }).length;
                }),
                findMany: jest.fn(async ({
                    where,
                }: {
                    where?: { appointmentDate?: Date };
                }) => {
                    return sortAppointments(
                        appointmentStore.filter((appointment) => {
                            if (
                                where?.appointmentDate
                                && !sameDate(
                                    appointment.appointmentDate,
                                    where.appointmentDate,
                                )
                            ) {
                                return false;
                            }

                            return true;
                        }),
                    ).map(buildAppointmentEntity);
                }),
            },
            admission: {
                count: jest.fn(async ({
                    where,
                }: {
                    where?: { status?: string };
                }) => {
                    return admissionStore.filter((admission) => {
                        if (where?.status && admission.status !== where.status) {
                            return false;
                        }

                        return true;
                    }).length;
                }),
                findMany: jest.fn(async ({
                    where,
                }: {
                    where?: { status?: string };
                }) => {
                    return sortAdmissions(
                        admissionStore.filter((admission) => {
                            if (where?.status && admission.status !== where.status) {
                                return false;
                            }

                            return true;
                        }),
                    ).map(buildAdmissionEntity);
                }),
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
                            const count = admissionStore.filter((admission) => {
                                return admission.roomId === roomId
                                    && admission.status === where.status;
                            }).length;

                            if (count === 0) {
                                return null;
                            }

                            return {
                                roomId,
                                _count: {
                                    _all: count,
                                },
                            };
                        })
                        .filter((item): item is {
                            roomId: string;
                            _count: { _all: number };
                        } => item !== null);
                }),
            },
            invoice: {
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
        __resetDashboard: () => {
            patientStore.length = 0;
            doctorStore.length = 0;
            departmentStore.length = 0;
            roomStore.length = 0;
            appointmentStore.length = 0;
            admissionStore.length = 0;
            invoiceStore.length = 0;
            patientCount = 1;
            doctorCount = 1;
            departmentCount = 1;
            roomCount = 1;
            appointmentCount = 1;
            admissionCount = 1;
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

            return patient;
        },
        __seedDoctor: (overrides?: Partial<MockDoctor>) => {
            const doctor: MockDoctor = {
                id: overrides?.id ?? `doctor-${doctorCount}`,
                firstName: overrides?.firstName ?? `Doctor${doctorCount}`,
                lastName: overrides?.lastName ?? 'Test',
                specialization: overrides?.specialization ?? 'General',
            };

            doctorCount += 1;
            doctorStore.push(doctor);

            return doctor;
        },
        __seedDepartment: (overrides?: Partial<MockDepartment>) => {
            const department: MockDepartment = {
                id: overrides?.id ?? `department-${departmentCount}`,
                name: overrides?.name ?? `Department${departmentCount}`,
                location: overrides?.location ?? 'Main Building',
            };

            departmentCount += 1;
            departmentStore.push(department);

            return department;
        },
        __seedRoom: (overrides: Partial<MockRoom> & { departmentId: string }) => {
            const room: MockRoom = {
                id: overrides.id ?? `room-${roomCount}`,
                roomNumber: overrides.roomNumber ?? `${100 + roomCount}`,
                departmentId: overrides.departmentId,
                type: overrides.type ?? 'GENERAL',
                status: overrides.status ?? 'AVAILABLE',
                capacity: overrides.capacity ?? 1,
            };

            roomCount += 1;
            roomStore.push(room);

            return room;
        },
        __seedAppointment: (
            overrides: Omit<MockAppointment, 'id' | 'createdAt' | 'updatedAt'>,
        ) => {
            const now = new Date();
            const appointment: MockAppointment = {
                id: `appointment-${appointmentCount}`,
                ...overrides,
                createdAt: now,
                updatedAt: now,
            };

            appointmentCount += 1;
            appointmentStore.push(appointment);

            return appointment;
        },
        __seedAdmission: (
            overrides: Omit<MockAdmission, 'id' | 'createdAt' | 'updatedAt'>,
        ) => {
            const now = new Date();
            const admission: MockAdmission = {
                id: `admission-${admissionCount}`,
                ...overrides,
                createdAt: now,
                updatedAt: now,
            };

            admissionCount += 1;
            admissionStore.push(admission);

            return admission;
        },
        __seedInvoice: (overrides: Omit<MockInvoice, 'id'>) => {
            const invoice: MockInvoice = {
                id: `invoice-${invoiceCount}`,
                ...overrides,
            };

            invoiceCount += 1;
            invoiceStore.push(invoice);

            return invoice;
        },
    };
});

import { createApp } from '../../src/app';

const prismaMock = jest.requireMock('../../src/infrastructure/db/prisma') as {
    __resetDashboard: () => void;
    __seedPatient: (overrides?: {
        id?: string;
        firstName?: string;
        lastName?: string;
        isDeleted?: boolean;
    }) => {
        id: string;
        firstName: string;
        lastName: string;
        isDeleted: boolean;
    };
    __seedDoctor: (overrides?: {
        id?: string;
        firstName?: string;
        lastName?: string;
        specialization?: string;
    }) => {
        id: string;
        firstName: string;
        lastName: string;
        specialization: string;
    };
    __seedDepartment: (overrides?: {
        id?: string;
        name?: string;
        location?: string;
    }) => {
        id: string;
        name: string;
        location: string;
    };
    __seedRoom: (overrides: {
        id?: string;
        roomNumber?: string;
        departmentId: string;
        type?: string;
        status?: string;
        capacity?: number;
    }) => {
        id: string;
        roomNumber: string;
        departmentId: string;
        type: string;
        status: string;
        capacity: number;
    };
    __seedAppointment: (overrides: {
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
    __seedAdmission: (overrides: {
        patientId: string;
        roomId: string;
        admissionDate: Date;
        dischargeDate: Date | null;
        status: string;
    }) => {
        id: string;
        patientId: string;
        roomId: string;
        admissionDate: Date;
        dischargeDate: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    };
    __seedInvoice: (overrides: {
        patientId: string;
        amount: number;
        status: string;
    }) => {
        id: string;
        patientId: string;
        amount: number;
        status: string;
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

function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function addDays(baseDate: Date, days: number) {
    const nextDate = new Date(baseDate);

    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
}

describe('Dashboard routes', () => {
    const app = createApp();

    beforeEach(() => {
        prismaMock.__resetDashboard();
        env.jwtAccessSecret = 'test-access-secret';
    });

    it('should reject unauthenticated dashboard requests', async () => {
        const response = await request(app).get('/api/dashboard/stats');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    it('should return dashboard stats, today appointments, and active admissions', async () => {
        const token = createAccessToken(['ADMIN']);
        const today = new Date();
        const todayDate = formatLocalDate(today);
        const tomorrowDate = formatLocalDate(addDays(today, 1));
        const patientOne = prismaMock.__seedPatient({
            firstName: 'Ana',
            lastName: 'Krasniqi',
        });
        const patientTwo = prismaMock.__seedPatient({
            firstName: 'Besa',
            lastName: 'Hoti',
        });
        prismaMock.__seedPatient({
            firstName: 'Removed',
            lastName: 'Patient',
            isDeleted: true,
        });
        const doctorOne = prismaMock.__seedDoctor({
            firstName: 'Arben',
            lastName: 'Hoxha',
            specialization: 'Cardiology',
        });
        prismaMock.__seedDoctor({
            firstName: 'Lira',
            lastName: 'Gashi',
            specialization: 'Neurology',
        });
        const department = prismaMock.__seedDepartment({
            name: 'Cardiology',
            location: 'First Floor',
        });
        const availableRoom = prismaMock.__seedRoom({
            departmentId: department.id,
            roomNumber: '101',
            status: 'AVAILABLE',
            type: 'GENERAL',
            capacity: 2,
        });
        const occupiedRoom = prismaMock.__seedRoom({
            departmentId: department.id,
            roomNumber: '102',
            status: 'OCCUPIED',
            type: 'ICU',
            capacity: 1,
        });
        prismaMock.__seedAppointment({
            patientId: patientOne.id,
            doctorId: doctorOne.id,
            appointmentDate: new Date(`${todayDate}T00:00:00.000Z`),
            appointmentTime: '09:30',
            status: 'Scheduled',
            notes: 'Morning check',
        });
        prismaMock.__seedAppointment({
            patientId: patientTwo.id,
            doctorId: doctorOne.id,
            appointmentDate: new Date(`${tomorrowDate}T00:00:00.000Z`),
            appointmentTime: '11:00',
            status: 'Scheduled',
            notes: null,
        });
        prismaMock.__seedAdmission({
            patientId: patientTwo.id,
            roomId: occupiedRoom.id,
            admissionDate: new Date(`${todayDate}T08:00:00.000Z`),
            dischargeDate: null,
            status: 'ACTIVE',
        });
        prismaMock.__seedAdmission({
            patientId: patientOne.id,
            roomId: availableRoom.id,
            admissionDate: new Date(`${todayDate}T06:00:00.000Z`),
            dischargeDate: new Date(`${todayDate}T12:00:00.000Z`),
            status: 'DISCHARGED',
        });
        prismaMock.__seedInvoice({
            patientId: patientOne.id,
            amount: 120.5,
            status: 'PENDING',
        });
        prismaMock.__seedInvoice({
            patientId: patientTwo.id,
            amount: 79.5,
            status: 'PENDING',
        });
        prismaMock.__seedInvoice({
            patientId: patientTwo.id,
            amount: 240,
            status: 'PAID',
        });

        const statsResponse = await request(app)
            .get('/api/dashboard/stats')
            .set('Authorization', `Bearer ${token}`);

        expect(statsResponse.status).toBe(200);
        expect(statsResponse.body).toEqual({
            appointmentsToday: 1,
            availableRooms: 1,
            admittedPatients: 1,
            totalPatients: 2,
            totalDoctors: 2,
            pendingInvoicesAmount: 200,
        });

        const todayAppointmentsResponse = await request(app)
            .get('/api/dashboard/appointments/today')
            .set('Authorization', `Bearer ${token}`);

        expect(todayAppointmentsResponse.status).toBe(200);
        expect(todayAppointmentsResponse.body).toHaveLength(1);
        expect(todayAppointmentsResponse.body[0]).toMatchObject({
            appointmentTime: '09:30',
            patient: {
                firstName: 'Ana',
                lastName: 'Krasniqi',
            },
            doctor: {
                firstName: 'Arben',
                lastName: 'Hoxha',
            },
        });

        const activeAdmissionsResponse = await request(app)
            .get('/api/dashboard/admissions/active')
            .set('Authorization', `Bearer ${token}`);

        expect(activeAdmissionsResponse.status).toBe(200);
        expect(activeAdmissionsResponse.body).toHaveLength(1);
        expect(activeAdmissionsResponse.body[0]).toMatchObject({
            status: 'ACTIVE',
            patient: {
                firstName: 'Besa',
                lastName: 'Hoti',
            },
            room: {
                roomNumber: '102',
                type: 'ICU',
                department: {
                    name: 'Cardiology',
                    location: 'First Floor',
                },
            },
        });
    });

    it('should expose available rooms through the dashboard namespace', async () => {
        const token = createAccessToken(['ADMIN']);
        const department = prismaMock.__seedDepartment({
            name: 'Emergency',
            location: 'Block B',
        });
        const availableRoom = prismaMock.__seedRoom({
            departmentId: department.id,
            roomNumber: '201',
            status: 'AVAILABLE',
            type: 'GENERAL',
            capacity: 2,
        });
        const fullRoom = prismaMock.__seedRoom({
            departmentId: department.id,
            roomNumber: '202',
            status: 'AVAILABLE',
            type: 'ICU',
            capacity: 1,
        });
        const patient = prismaMock.__seedPatient({
            firstName: 'Drita',
            lastName: 'Berisha',
        });

        prismaMock.__seedAdmission({
            patientId: patient.id,
            roomId: fullRoom.id,
            admissionDate: new Date(),
            dischargeDate: null,
            status: 'ACTIVE',
        });

        const response = await request(app)
            .get('/api/dashboard/rooms/available')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]).toMatchObject({
            id: availableRoom.id,
            roomNumber: '201',
            status: 'AVAILABLE',
            availableCapacity: 2,
        });
    });
});
