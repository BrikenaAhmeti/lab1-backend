import { Command } from '../../../shared/core/buses/command-bus';
import { UpdatePatientDto } from '../dto/patient.dto';

export class UpdatePatientCommand implements Command {
    constructor(
        public readonly id: string,
        public readonly data: UpdatePatientDto,
    ) { }
}
