import { Command } from '../../../../shared/core/buses/command-bus';
import { AuthenticatedUser } from '../../../../shared/core/types/request-with-user';

export class DeleteAppointmentCommand implements Command {
    constructor(
        public readonly id: string,
        public readonly user?: AuthenticatedUser,
    ) { }
}
