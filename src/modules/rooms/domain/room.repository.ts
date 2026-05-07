import {
    RoomDepartmentEntity,
    RoomStatus,
    RoomStoredEntity,
    RoomType,
} from './room.entity';

export interface CreateRoomData {
    roomNumber: string;
    departmentId: string;
    type: RoomType;
    status: RoomStatus;
    capacity: number;
}

export interface UpdateRoomData {
    roomNumber?: string;
    departmentId?: string;
    type?: RoomType;
    status?: RoomStatus;
    capacity?: number;
}

export interface FindRoomsParams {
    departmentId?: string;
    type?: RoomType;
}

export interface RoomRepository {
    create(data: CreateRoomData): Promise<RoomStoredEntity>;
    findMany(params: FindRoomsParams): Promise<RoomStoredEntity[]>;
    findById(id: string): Promise<RoomStoredEntity | null>;
    findByRoomNumber(roomNumber: string): Promise<RoomStoredEntity | null>;
    findDepartmentById(
        departmentId: string,
    ): Promise<RoomDepartmentEntity | null>;
    countActiveAdmissionsByRoomIds(
        roomIds: string[],
    ): Promise<Record<string, number>>;
    update(id: string, data: UpdateRoomData): Promise<RoomStoredEntity>;
    delete(id: string): Promise<RoomStoredEntity>;
}
