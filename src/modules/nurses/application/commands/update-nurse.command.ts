import { Command } from '../../../../shared/core/buses/command-bus';
import { UpdateNurseDto } from '../../dto/nurse.dto';

export class UpdateNurseCommand implements Command {
    constructor(
        public readonly id: string,
        public readonly data: UpdateNurseDto,
    ) { }
}
