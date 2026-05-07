import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { RoomEntity } from '../../domain/room.entity';
import { RoomService } from '../../services/room.service';
import { UpdateRoomCommand } from '../commands/update-room.command';

export class UpdateRoomHandler
    implements CommandHandler<UpdateRoomCommand, RoomEntity> {
    constructor(private readonly roomService: RoomService) { }

    async execute(command: UpdateRoomCommand): Promise<RoomEntity> {
        return this.roomService.updateRoom(command.id, command.data);
    }
}
