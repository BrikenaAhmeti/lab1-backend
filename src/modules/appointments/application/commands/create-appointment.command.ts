import { Command } from '../../../../shared/core/buses/command-bus';
import { AuthenticatedUser } from '../../../../shared/core/types/request-with-user';
import { CreateAppointmentDto } from '../../dto/appointment.dto';

export class CreateAppointmentCommand implements Command {
    constructor(
        public readonly data: CreateAppointmentDto,
        public readonly user?: AuthenticatedUser,
    ) { }
}
