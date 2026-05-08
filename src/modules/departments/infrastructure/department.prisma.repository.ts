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
    DepartmentNurseEntity,
    DepartmentRoomEntity,
} from '../domain/department.entity';

function resolveRoomStatus(
    status: string,
    capacity: number,
    activeAdmissionsCount: number,
) {
    if (status === 'UNDER_MAINTENANCE') {
        return status;
    }

    if (Math.max(capacity - activeAdmissionsCount, 0) === 0) {
        return 'OCCUPIED';
    }

    return 'AVAILABLE';
}

type GroupedAdmissionCount = {
    roomId: string;
    _count: {
        _all: number;
    };
};

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
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.description !== undefined
                    ? { description: data.description }
                    : {}),
                ...(data.location !== undefined
                    ? { location: data.location }
                    : {}),
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
        const rooms = await prisma.room.findMany({
            where: {
                departmentId,
            },
            orderBy: {
                roomNumber: 'asc',
            },
        });

        if (rooms.length === 0) {
            return rooms;
        }

        const groupedAdmissions = await prisma.admission.groupBy({
            by: ['roomId'],
            where: {
                roomId: {
                    in: rooms.map((room) => room.id),
                },
                status: 'ACTIVE',
            },
            _count: {
                _all: true,
            },
        });

        const counts = groupedAdmissions.reduce<Record<string, number>>(
            (result, item: GroupedAdmissionCount) => {
                result[item.roomId] = item._count._all;

                return result;
            },
            {},
        );

        return rooms.map((room) => ({
            ...room,
            status: resolveRoomStatus(
                room.status,
                room.capacity,
                counts[room.id] ?? 0,
            ),
        }));
    }

    async findNursesByDepartmentId(
        departmentId: string,
    ): Promise<DepartmentNurseEntity[]> {
        return prisma.nurse.findMany({
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
