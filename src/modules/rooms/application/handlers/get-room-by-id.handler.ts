import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { RoomEntity } from '../../domain/room.entity';
import { RoomService } from '../../services/room.service';
import { GetRoomByIdQuery } from '../queries/get-room-by-id.query';

export class GetRoomByIdHandler
    implements QueryHandler<GetRoomByIdQuery, RoomEntity> {
    constructor(private readonly roomService: RoomService) { }

    async execute(query: GetRoomByIdQuery): Promise<RoomEntity> {
        return this.roomService.getRoomById(query.id);
    }
}
