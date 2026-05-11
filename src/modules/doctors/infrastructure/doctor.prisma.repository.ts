import { prisma } from '../../../infrastructure/db/prisma';
import {
    CreateDoctorData,
    DoctorUsage,
    DoctorRepository,
    UpdateDoctorData,
} from '../domain/doctor.repository';
import {
    DoctorDepartmentEntity,
    DoctorEntity,
    DoctorUserEntity,
} from '../domain/doctor.entity';

const doctorInclude = {
    department: {
        select: {
            id: true,
            name: true,
            location: true,
        },
    },
} as const;

export class DoctorPrismaRepository implements DoctorRepository {
    async create(data: CreateDoctorData): Promise<DoctorEntity> {
        return prisma.doctor.create({
            data,
            include: doctorInclude,
        });
    }

    async findMany(): Promise<DoctorEntity[]> {
        return prisma.doctor.findMany({
            where: {
                isActive: true,
            },
            include: doctorInclude,
            orderBy: [
                {
                    lastName: 'asc',
                },
                {
                    firstName: 'asc',
                },
            ],
        });
    }

    async findById(id: string): Promise<DoctorEntity | null> {
        return prisma.doctor.findFirst({
            where: {
                id,
                isActive: true,
            },
            include: doctorInclude,
        });
    }

    async findByIdIncludingInactive(id: string): Promise<DoctorEntity | null> {
        return prisma.doctor.findUnique({
            where: { id },
            include: doctorInclude,
        });
    }

    async findByUserId(userId: string): Promise<DoctorEntity | null> {
        return prisma.doctor.findUnique({
            where: { userId },
            include: doctorInclude,
        });
    }

    async findUserById(userId: string): Promise<DoctorUserEntity | null> {
        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
            },
        });
    }

    async findDepartmentById(
        departmentId: string,
    ): Promise<DoctorDepartmentEntity | null> {
        return prisma.department.findUnique({
            where: { id: departmentId },
            select: {
                id: true,
                name: true,
                location: true,
            },
        });
    }

    async update(id: string, data: UpdateDoctorData): Promise<DoctorEntity> {
        return prisma.doctor.update({
            where: { id },
            data,
            include: doctorInclude,
        });
    }

    async delete(id: string): Promise<DoctorEntity> {
        return prisma.doctor.delete({
            where: { id },
            include: doctorInclude,
        });
    }

    async deactivate(id: string): Promise<DoctorEntity> {
        return prisma.doctor.update({
            where: { id },
            data: {
                isActive: false,
            },
            include: doctorInclude,
        });
    }

    async setStatus(id: string, isActive: boolean): Promise<DoctorEntity> {
        return prisma.doctor.update({
            where: { id },
            data: {
                isActive,
            },
            include: doctorInclude,
        });
    }

    async countUsage(id: string): Promise<DoctorUsage> {
        const [appointments, medicalRecords] = await Promise.all([
            prisma.appointment.count({
                where: {
                    doctorId: id,
                },
            }),
            prisma.medicalRecord.count({
                where: {
                    doctorId: id,
                },
            }),
        ]);

        return {
            appointments,
            medicalRecords,
        };
    }
}
