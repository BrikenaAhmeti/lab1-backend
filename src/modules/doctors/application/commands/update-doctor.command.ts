import { Command } from '../../../../shared/core/buses/command-bus';
import { UpdateDoctorDto } from '../../dto/doctor.dto';

export class UpdateDoctorCommand implements Command {
    constructor(
        public readonly id: string,
        public readonly data: UpdateDoctorDto,
    ) { }
}
