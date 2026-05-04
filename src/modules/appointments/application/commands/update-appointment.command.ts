import { Command } from '../../../../shared/core/buses/command-bus';
import { UpdateAppointmentDto } from '../../dto/appointment.dto';

export class UpdateAppointmentCommand implements Command {
    constructor(
        public readonly id: string,
        public readonly data: UpdateAppointmentDto,
    ) { }
}
