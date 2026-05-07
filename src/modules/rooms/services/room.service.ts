import { AppError } from '../../../shared/core/errors/app-error';
import { RoomEntity, RoomStatus, RoomStoredEntity } from '../domain/room.entity';
import { RoomRepository, UpdateRoomData } from '../domain/room.repository';
import {
    CreateRoomDto,
    GetRoomsQueryDto,
    UpdateRoomDto,
} from '../dto/room.dto';

export class RoomService {
    constructor(private readonly roomRepository: RoomRepository) { }

    async createRoom(data: CreateRoomDto): Promise<RoomEntity> {
        const roomNumber = data.roomNumber.trim();
        const departmentId = data.departmentId.trim();

        await this.ensureDepartmentExists(departmentId);

        const existingRoom = await this.roomRepository.findByRoomNumber(roomNumber);

        if (existingRoom) {
            throw new AppError('Room already exists', 409);
        }

        const room = await this.roomRepository.create({
            roomNumber,
            departmentId,
            type: data.type,
            status: this.normalizeStoredStatus(data.status),
            capacity: data.capacity,
        });

        return this.decorateRoom(room);
    }

    async getRooms(data: GetRoomsQueryDto): Promise<RoomEntity[]> {
        const departmentId = data.departmentId?.trim();

        if (departmentId) {
            await this.ensureDepartmentExists(departmentId);
        }

        const rooms = await this.roomRepository.findMany({
            departmentId,
            type: data.type,
        });

        return this.decorateRooms(rooms);
    }

    async getAvailableRooms(data: GetRoomsQueryDto): Promise<RoomEntity[]> {
        const rooms = await this.getRooms(data);

        return rooms.filter((room) => {
            return (
                room.status !== 'UNDER_MAINTENANCE'
                && room.availableCapacity > 0
            );
        });
    }

    async getRoomById(id: string): Promise<RoomEntity> {
        const room = await this.ensureRoomExists(id);

        return this.decorateRoom(room);
    }

    async updateRoom(id: string, data: UpdateRoomDto): Promise<RoomEntity> {
        const room = await this.ensureRoomExists(id);

        if (data.departmentId !== undefined) {
            await this.ensureDepartmentExists(data.departmentId.trim());
        }

        if (data.roomNumber !== undefined) {
            const roomNumber = data.roomNumber.trim();
            const roomWithSameNumber = await this.roomRepository.findByRoomNumber(
                roomNumber,
            );

            if (roomWithSameNumber && roomWithSameNumber.id !== id) {
                throw new AppError('Room already exists', 409);
            }
        }

        const activeAdmissionsCount = await this.getActiveAdmissionsCount(id);

        if (
            data.capacity !== undefined
            && data.capacity < activeAdmissionsCount
        ) {
            throw new AppError(
                'Room capacity cannot be lower than active admissions count',
                400,
            );
        }

        const updateData: UpdateRoomData = {
            ...(data.roomNumber !== undefined
                ? { roomNumber: data.roomNumber.trim() }
                : {}),
            ...(data.departmentId !== undefined
                ? { departmentId: data.departmentId.trim() }
                : {}),
            ...(data.type !== undefined
                ? { type: data.type }
                : {}),
            ...(data.status !== undefined
                ? {
                    status: this.normalizeStoredStatus(
                        data.status,
                    ),
                }
                : {}),
            ...(data.capacity !== undefined
                ? { capacity: data.capacity }
                : {}),
        };

        const updatedRoom = await this.roomRepository.update(id, updateData);

        return this.decorateRoom(updatedRoom);
    }

    async deleteRoom(id: string): Promise<void> {
        await this.ensureRoomExists(id);

        const activeAdmissionsCount = await this.getActiveAdmissionsCount(id);

        if (activeAdmissionsCount > 0) {
            throw new AppError(
                'Room cannot be deleted while it has active admissions',
                409,
            );
        }

        await this.roomRepository.delete(id);
    }

    private async ensureRoomExists(id: string): Promise<RoomStoredEntity> {
        const room = await this.roomRepository.findById(id);

        if (!room) {
            throw new AppError('Room not found', 404);
        }

        return room;
    }

    private async ensureDepartmentExists(departmentId: string): Promise<void> {
        const department = await this.roomRepository.findDepartmentById(
            departmentId,
        );

        if (!department) {
            throw new AppError('Department not found', 404);
        }
    }

    private async getActiveAdmissionsCount(roomId: string): Promise<number> {
        const counts = await this.roomRepository.countActiveAdmissionsByRoomIds([
            roomId,
        ]);

        return counts[roomId] ?? 0;
    }

    private async decorateRoom(room: RoomStoredEntity): Promise<RoomEntity> {
        const counts = await this.roomRepository.countActiveAdmissionsByRoomIds([
            room.id,
        ]);

        return this.toRoomEntity(room, counts[room.id] ?? 0);
    }

    private async decorateRooms(rooms: RoomStoredEntity[]): Promise<RoomEntity[]> {
        if (rooms.length === 0) {
            return [];
        }

        const counts = await this.roomRepository.countActiveAdmissionsByRoomIds(
            rooms.map((room) => room.id),
        );

        return rooms.map((room) => this.toRoomEntity(room, counts[room.id] ?? 0));
    }

    private toRoomEntity(
        room: RoomStoredEntity,
        activeAdmissionsCount: number,
    ): RoomEntity {
        const availableCapacity = Math.max(
            room.capacity - activeAdmissionsCount,
            0,
        );

        return {
            ...room,
            status: this.resolveStatus(room.status, availableCapacity),
            activeAdmissionsCount,
            availableCapacity,
        };
    }

    private resolveStatus(
        status: RoomStatus,
        availableCapacity: number,
    ): RoomStatus {
        if (status === 'UNDER_MAINTENANCE') {
            return status;
        }

        if (availableCapacity === 0) {
            return 'OCCUPIED';
        }

        return 'AVAILABLE';
    }

    private normalizeStoredStatus(status?: RoomStatus): RoomStatus {
        if (status === 'UNDER_MAINTENANCE') {
            return status;
        }

        return 'AVAILABLE';
    }
}
