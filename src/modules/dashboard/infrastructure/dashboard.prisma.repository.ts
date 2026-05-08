import { prisma } from '../../../infrastructure/db/prisma';
import { RoomStatus, RoomType } from '../../rooms/domain/room.entity';
import {
    AdmissionPatientEntity,
    AdmissionRoomDepartmentEntity,
    AdmissionStatus,
} from '../../admissions/domain/admission.entity';
import {
    DashboardActiveAdmissionEntity,
    DashboardStatsEntity,
    DashboardTodayAppointmentEntity,
} from '../domain/dashboard.entity';
import { DashboardRepository } from '../domain/dashboard.repository';

const appointmentInclude = {
    patient: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
        },
    },
    doctor: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
        },
    },
} as const;

const admissionInclude = {
    patient: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
        },
    },
    room: {
        include: {
            department: {
                select: {
                    id: true,
                    name: true,
                    location: true,
                },
            },
        },
    },
} as const;

function toAmount(value: { toNumber: () => number } | number | string): number {
    if (typeof value === 'number') {
        return value;
    }

    if (typeof value === 'string') {
        return Number(value);
    }

    return value.toNumber();
}

function toAdmissionEntity(admission: {
    id: string;
    patientId: string;
    roomId: string;
    admissionDate: Date;
    dischargeDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    patient: AdmissionPatientEntity;
    room: {
        id: string;
        roomNumber: string;
        departmentId: string;
        type: string;
        status: string;
        capacity: number;
        department: AdmissionRoomDepartmentEntity;
    };
}): DashboardActiveAdmissionEntity {
    return {
        ...admission,
        status: admission.status as AdmissionStatus,
        room: {
            ...admission.room,
            type: admission.room.type as RoomType,
            status: admission.room.status as RoomStatus,
        },
    };
}

export class DashboardPrismaRepository implements DashboardRepository {
    async getStats(date: Date): Promise<DashboardStatsEntity> {
        const [
            appointmentsToday,
            availableRooms,
            admittedPatients,
            totalPatients,
            totalDoctors,
            pendingInvoicesAmountResult,
        ] = await Promise.all([
            prisma.appointment.count({
                where: {
                    appointmentDate: date,
                },
            }),
            prisma.room.count({
                where: {
                    status: 'AVAILABLE',
                },
            }),
            prisma.admission.count({
                where: {
                    status: 'ACTIVE',
                },
            }),
            prisma.patient.count({
                where: {
                    isDeleted: false,
                },
            }),
            prisma.doctor.count(),
            prisma.invoice.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    status: 'PENDING',
                },
            }),
        ]);

        return {
            appointmentsToday,
            availableRooms,
            admittedPatients,
            totalPatients,
            totalDoctors,
            pendingInvoicesAmount: pendingInvoicesAmountResult._sum.amount === null
                ? 0
                : toAmount(
                    pendingInvoicesAmountResult._sum.amount as
                    | { toNumber: () => number }
                    | number
                    | string,
                ),
        };
    }

    async getTodayAppointments(
        date: Date,
    ): Promise<DashboardTodayAppointmentEntity[]> {
        return prisma.appointment.findMany({
            where: {
                appointmentDate: date,
            },
            include: appointmentInclude,
            orderBy: [
                {
                    appointmentDate: 'asc',
                },
                {
                    appointmentTime: 'asc',
                },
            ],
        });
    }

    async getActiveAdmissions(): Promise<DashboardActiveAdmissionEntity[]> {
        const admissions = await prisma.admission.findMany({
            where: {
                status: 'ACTIVE',
            },
            include: admissionInclude,
            orderBy: {
                admissionDate: 'desc',
            },
        });

        return admissions.map(toAdmissionEntity);
    }
}
