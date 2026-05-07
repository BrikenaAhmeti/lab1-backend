import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { RoomService } from '../../services/room.service';
import { DeleteRoomCommand } from '../commands/delete-room.command';

export class DeleteRoomHandler
    implements CommandHandler<DeleteRoomCommand, void> {
    constructor(private readonly roomService: RoomService) { }

    async execute(command: DeleteRoomCommand): Promise<void> {
        await this.roomService.deleteRoom(command.id);
    }
}
