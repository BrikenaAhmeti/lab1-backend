import { prisma } from '../../../infrastructure/db/prisma';
import {
    CreateDoctorData,
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
}
