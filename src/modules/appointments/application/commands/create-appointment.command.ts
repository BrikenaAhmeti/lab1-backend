import { Command } from '../../../../shared/core/buses/command-bus';
import { CreateAppointmentDto } from '../../dto/appointment.dto';

export class CreateAppointmentCommand implements Command {
    constructor(public readonly data: CreateAppointmentDto) { }
}
