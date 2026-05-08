import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { PaginatedResponse } from '../../../../shared/core/pagination';
import { RoomEntity } from '../../domain/room.entity';
import { RoomService } from '../../services/room.service';
import { GetAvailableRoomsQuery } from '../queries/get-available-rooms.query';

export class GetAvailableRoomsHandler
    implements QueryHandler<GetAvailableRoomsQuery, PaginatedResponse<RoomEntity>> {
    constructor(private readonly roomService: RoomService) { }

    async execute(
        query: GetAvailableRoomsQuery,
    ): Promise<PaginatedResponse<RoomEntity>> {
        return this.roomService.getAvailableRooms(query.data);
    }
}
