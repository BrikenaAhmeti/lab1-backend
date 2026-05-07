import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { RoomEntity } from '../../domain/room.entity';
import { RoomService } from '../../services/room.service';
import { CreateRoomCommand } from '../commands/create-room.command';

export class CreateRoomHandler
    implements CommandHandler<CreateRoomCommand, RoomEntity> {
    constructor(private readonly roomService: RoomService) { }

    async execute(command: CreateRoomCommand): Promise<RoomEntity> {
        return this.roomService.createRoom(command.data);
    }
}
