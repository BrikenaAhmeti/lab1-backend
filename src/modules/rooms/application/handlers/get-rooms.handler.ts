import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { PaginatedResponse } from '../../../../shared/core/pagination';
import { RoomEntity } from '../../domain/room.entity';
import { RoomService } from '../../services/room.service';
import { GetRoomsQuery } from '../queries/get-rooms.query';

export class GetRoomsHandler
    implements QueryHandler<GetRoomsQuery, PaginatedResponse<RoomEntity>> {
    constructor(private readonly roomService: RoomService) { }

    async execute(query: GetRoomsQuery): Promise<PaginatedResponse<RoomEntity>> {
        return this.roomService.getRooms(query.data);
    }
}
