import { Command } from '../../../../shared/core/buses/command-bus';
import { UpdateRoomDto } from '../../dto/room.dto';

export class UpdateRoomCommand implements Command {
    constructor(
        public readonly id: string,
        public readonly data: UpdateRoomDto,
    ) { }
}
