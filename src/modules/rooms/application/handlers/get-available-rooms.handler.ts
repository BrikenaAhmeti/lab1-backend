import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { RoomEntity } from '../../domain/room.entity';
import { RoomService } from '../../services/room.service';
import { GetAvailableRoomsQuery } from '../queries/get-available-rooms.query';

export class GetAvailableRoomsHandler
    implements QueryHandler<GetAvailableRoomsQuery, RoomEntity[]> {
    constructor(private readonly roomService: RoomService) { }

    async execute(query: GetAvailableRoomsQuery): Promise<RoomEntity[]> {
        return this.roomService.getAvailableRooms(query.data);
    }
}
