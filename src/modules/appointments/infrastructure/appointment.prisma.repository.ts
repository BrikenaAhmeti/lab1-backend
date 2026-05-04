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

export class AppointmentPrismaRepository implements AppointmentRepository {
    async create(data: CreateAppointmentData): Promise<AppointmentEntity> {
        return prisma.appointment.create({
            data,
            include: appointmentInclude,
        });
    }

    async findMany(params: FindAppointmentsParams): Promise<AppointmentEntity[]> {
        return prisma.appointment.findMany({
            where: {
                ...(params.appointmentDate
                    ? { appointmentDate: params.appointmentDate }
                    : {}),
                ...(params.doctorId ? { doctorId: params.doctorId } : {}),
                ...(params.patientId ? { patientId: params.patientId } : {}),
                ...(params.status ? { status: params.status } : {}),
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

    async findById(id: string): Promise<AppointmentEntity | null> {
        return prisma.appointment.findUnique({
            where: { id },
            include: appointmentInclude,
        });
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
            },
        });
    }

    async findConflict(
        params: FindAppointmentConflictParams,
    ): Promise<AppointmentEntity | null> {
        return prisma.appointment.findFirst({
            where: {
                doctorId: params.doctorId,
                appointmentDate: params.appointmentDate,
                appointmentTime: params.appointmentTime,
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
        });
    }

    async update(
        id: string,
        data: UpdateAppointmentData,
    ): Promise<AppointmentEntity> {
        return prisma.appointment.update({
            where: { id },
            data,
            include: appointmentInclude,
        });
    }
}
