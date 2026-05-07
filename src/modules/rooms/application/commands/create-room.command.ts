import { Command } from '../../../../shared/core/buses/command-bus';
import { CreateRoomDto } from '../../dto/room.dto';

export class CreateRoomCommand implements Command {
    constructor(public readonly data: CreateRoomDto) { }
}
