import { prisma } from '../../../infrastructure/db/prisma';
import {
    AppointmentRepository,
    CreateAppointmentData,
    FindAppointmentConflictParams,
    FindAppointmentsParams,
    UpdateAppointmentData,
} from '../domain/appointment.repository';
import { AppointmentEntity, AppointmentReferenceEntity } from '../domain/appointment.entity';

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

function toAppointmentDate(appointmentDateTime: Date): Date {
    return new Date(`${appointmentDateTime.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

function toAppointmentTime(appointmentDateTime: Date): string {
    return appointmentDateTime.toISOString().slice(11, 16);
}

function addUtcDay(date: Date): Date {
    const nextDate = new Date(date);

    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    return nextDate;
}

function toAppointmentEntity(
    appointment: Omit<AppointmentEntity, 'appointmentDate' | 'appointmentTime'>,
): AppointmentEntity {
    return {
        ...appointment,
        appointmentDate: toAppointmentDate(appointment.appointmentDateTime),
        appointmentTime: toAppointmentTime(appointment.appointmentDateTime),
    };
}

export class AppointmentPrismaRepository implements AppointmentRepository {
    async create(data: CreateAppointmentData): Promise<AppointmentEntity> {
        const appointment = await prisma.appointment.create({
            data,
            include: appointmentInclude,
        });

        return toAppointmentEntity(appointment);
    }

    async findMany(params: FindAppointmentsParams): Promise<AppointmentEntity[]> {
        const appointments = await prisma.appointment.findMany({
            where: {
                ...(params.appointmentDate
                    ? {
                        appointmentDateTime: {
                            gte: params.appointmentDate,
                            lt: addUtcDay(params.appointmentDate),
                        },
                    }
                    : {}),
                ...(params.doctorId ? { doctorId: params.doctorId } : {}),
                ...(params.patientId ? { patientId: params.patientId } : {}),
                ...(params.status ? { status: params.status } : {}),
            },
            include: appointmentInclude,
            orderBy: [
                {
                    appointmentDateTime: 'asc',
                },
            ],
        });

        return appointments.map(toAppointmentEntity);
    }

    async findById(id: string): Promise<AppointmentEntity | null> {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: appointmentInclude,
        });

        return appointment ? toAppointmentEntity(appointment) : null;
    }

    async findPatientById(id: string): Promise<AppointmentReferenceEntity | null> {
        return prisma.patient.findFirst({
            where: {
                id,
                isDeleted: false,
            },
            select: {
                id: true,
            },
        });
    }

    async findDoctorById(id: string): Promise<AppointmentReferenceEntity | null> {
        return prisma.doctor.findUnique({
            where: { id },
            select: {
                id: true,
                isActive: true,
            },
        });
    }

    async findConflict(
        params: FindAppointmentConflictParams,
    ): Promise<AppointmentEntity | null> {
        return prisma.appointment.findFirst({
            where: {
                doctorId: params.doctorId,
                appointmentDateTime: params.appointmentDateTime,
                status: {
                    not: 'Cancelled',
                },
                ...(params.excludeAppointmentId
                    ? {
                        id: {
                            not: params.excludeAppointmentId,
                        },
                    }
                    : {}),
            },
            include: appointmentInclude,
        }).then((appointment) => appointment ? toAppointmentEntity(appointment) : null);
    }

    async update(
        id: string,
        data: UpdateAppointmentData,
    ): Promise<AppointmentEntity> {
        const appointment = await prisma.appointment.update({
            where: { id },
            data,
            include: appointmentInclude,
        });

        return toAppointmentEntity(appointment);
    }
}
