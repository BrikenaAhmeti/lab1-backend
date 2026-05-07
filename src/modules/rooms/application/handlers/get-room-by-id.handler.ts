import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { RoomDetailEntity } from '../../domain/room.entity';
import { RoomService } from '../../services/room.service';
import { GetRoomByIdQuery } from '../queries/get-room-by-id.query';

export class GetRoomByIdHandler
    implements QueryHandler<GetRoomByIdQuery, RoomDetailEntity> {
    constructor(private readonly roomService: RoomService) { }

    async execute(query: GetRoomByIdQuery): Promise<RoomDetailEntity> {
        return this.roomService.getRoomById(query.id);
    }
}
