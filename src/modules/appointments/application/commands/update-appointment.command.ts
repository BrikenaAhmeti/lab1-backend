import { Command } from '../../../../shared/core/buses/command-bus';
import { AuthenticatedUser } from '../../../../shared/core/types/request-with-user';
import { UpdateAppointmentDto } from '../../dto/appointment.dto';

export class UpdateAppointmentCommand implements Command {
    constructor(
        public readonly id: string,
        public readonly data: UpdateAppointmentDto,
        public readonly user?: AuthenticatedUser,
    ) { }
}
