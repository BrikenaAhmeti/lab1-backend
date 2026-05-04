import { Command } from '../../../../shared/core/buses/command-bus';
import { CreateNurseDto } from '../../dto/nurse.dto';

export class CreateNurseCommand implements Command {
    constructor(public readonly data: CreateNurseDto) { }
}
