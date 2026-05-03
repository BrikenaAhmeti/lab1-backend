import { Command } from '../../../../shared/core/buses/command-bus';
import { CreateDoctorDto } from '../../dto/doctor.dto';

export class CreateDoctorCommand implements Command {
    constructor(public readonly data: CreateDoctorDto) { }
}
