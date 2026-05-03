import { prisma } from '../../../infrastructure/db/prisma';
import {
    CreateDepartmentData,
    DepartmentUsage,
    DepartmentRepository,
    UpdateDepartmentData,
} from '../domain/department.repository';
import {
    DepartmentDoctorEntity,
    DepartmentEntity,
    DepartmentRoomEntity,
} from '../domain/department.entity';

export class DepartmentPrismaRepository implements DepartmentRepository {
    async create(data: CreateDepartmentData): Promise<DepartmentEntity> {
        return prisma.department.create({
            data: {
                name: data.name,
                description: data.description,
                location: data.location,
            },
        });
    }

    async findMany(): Promise<DepartmentEntity[]> {
        return prisma.department.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }

    async findById(id: string): Promise<DepartmentEntity | null> {
        return prisma.department.findUnique({
            where: { id },
        });
    }

    async findByName(name: string): Promise<DepartmentEntity | null> {
        return prisma.department.findUnique({
            where: { name },
        });
    }

    async update(
        id: string,
        data: UpdateDepartmentData,
    ): Promise<DepartmentEntity> {
        return prisma.department.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                location: data.location,
            },
        });
    }

    async delete(id: string): Promise<DepartmentEntity> {
        return prisma.department.delete({
            where: { id },
        });
    }

    async findDoctorsByDepartmentId(
        departmentId: string,
    ): Promise<DepartmentDoctorEntity[]> {
        return prisma.doctor.findMany({
            where: {
                departmentId,
            },
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

    async findRoomsByDepartmentId(
        departmentId: string,
    ): Promise<DepartmentRoomEntity[]> {
        return prisma.room.findMany({
            where: {
                departmentId,
            },
            orderBy: {
                roomNumber: 'asc',
            },
        });
    }

    async countUsage(departmentId: string): Promise<DepartmentUsage> {
        const [doctors, rooms, nurses] = await Promise.all([
            prisma.doctor.count({
                where: {
                    departmentId,
                },
            }),
            prisma.room.count({
                where: {
                    departmentId,
                },
            }),
            prisma.nurse.count({
                where: {
                    departmentId,
                },
            }),
        ]);

        return {
            doctors,
            rooms,
            nurses,
        };
    }
}
