import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { RoomEntity } from '../../domain/room.entity';
import { RoomService } from '../../services/room.service';
import { GetRoomsQuery } from '../queries/get-rooms.query';

export class GetRoomsHandler
    implements QueryHandler<GetRoomsQuery, RoomEntity[]> {
    constructor(private readonly roomService: RoomService) { }

    async execute(query: GetRoomsQuery): Promise<RoomEntity[]> {
        return this.roomService.getRooms(query.data);
    }
}
