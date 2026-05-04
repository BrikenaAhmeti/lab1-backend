import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { AppointmentService } from '../../services/appointment.service';
import { DeleteAppointmentCommand } from '../commands/delete-appointment.command';

export class DeleteAppointmentHandler
    implements CommandHandler<DeleteAppointmentCommand> {
    constructor(private readonly appointmentService: AppointmentService) { }

    async execute(command: DeleteAppointmentCommand): Promise<void> {
        await this.appointmentService.cancelAppointment(command.id);
    }
}
