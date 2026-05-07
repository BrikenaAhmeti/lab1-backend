import { prisma } from '../../../infrastructure/db/prisma';
import {
    CreateRoomData,
    FindRoomsParams,
    RoomRepository,
    UpdateRoomData,
} from '../domain/room.repository';
import {
    RoomDepartmentEntity,
    RoomStatus,
    RoomStoredEntity,
    RoomType,
} from '../domain/room.entity';

const roomInclude = {
    department: {
        select: {
            id: true,
            name: true,
            location: true,
        },
    },
} as const;

type GroupedAdmissionCount = {
    roomId: string;
    _count: {
        _all: number;
    };
};

function toRoomStoredEntity(room: {
    id: string;
    roomNumber: string;
    departmentId: string;
    type: string;
    status: string;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
    department: RoomDepartmentEntity;
}): RoomStoredEntity {
    return {
        ...room,
        type: room.type as RoomType,
        status: room.status as RoomStatus,
    };
}

export class RoomPrismaRepository implements RoomRepository {
    async create(data: CreateRoomData): Promise<RoomStoredEntity> {
        const room = await prisma.room.create({
            data,
            include: roomInclude,
        });

        return toRoomStoredEntity(room);
    }

    async findMany(params: FindRoomsParams): Promise<RoomStoredEntity[]> {
        const rooms = await prisma.room.findMany({
            where: {
                ...(params.departmentId
                    ? { departmentId: params.departmentId }
                    : {}),
                ...(params.type ? { type: params.type } : {}),
            },
            include: roomInclude,
            orderBy: {
                roomNumber: 'asc',
            },
        });

        return rooms.map(toRoomStoredEntity);
    }

    async findById(id: string): Promise<RoomStoredEntity | null> {
        const room = await prisma.room.findUnique({
            where: { id },
            include: roomInclude,
        });

        return room ? toRoomStoredEntity(room) : null;
    }

    async findByRoomNumber(
        roomNumber: string,
    ): Promise<RoomStoredEntity | null> {
        const room = await prisma.room.findUnique({
            where: { roomNumber },
            include: roomInclude,
        });

        return room ? toRoomStoredEntity(room) : null;
    }

    async findDepartmentById(
        departmentId: string,
    ): Promise<RoomDepartmentEntity | null> {
        return prisma.department.findUnique({
            where: { id: departmentId },
            select: {
                id: true,
                name: true,
                location: true,
            },
        });
    }

    async countActiveAdmissionsByRoomIds(
        roomIds: string[],
    ): Promise<Record<string, number>> {
        if (roomIds.length === 0) {
            return {};
        }

        const groupedAdmissions = await prisma.admission.groupBy({
            by: ['roomId'],
            where: {
                roomId: {
                    in: roomIds,
                },
                status: 'ACTIVE',
            },
            _count: {
                _all: true,
            },
        });

        return groupedAdmissions.reduce<Record<string, number>>(
            (result, item: GroupedAdmissionCount) => {
                result[item.roomId] = item._count._all;

                return result;
            },
            {},
        );
    }

    async update(
        id: string,
        data: UpdateRoomData,
    ): Promise<RoomStoredEntity> {
        const room = await prisma.room.update({
            where: { id },
            data,
            include: roomInclude,
        });

        return toRoomStoredEntity(room);
    }

    async delete(id: string): Promise<RoomStoredEntity> {
        const room = await prisma.room.delete({
            where: { id },
            include: roomInclude,
        });

        return toRoomStoredEntity(room);
    }
}
