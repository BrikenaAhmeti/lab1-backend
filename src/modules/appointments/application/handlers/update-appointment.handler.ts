import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { AppointmentEntity } from '../../domain/appointment.entity';
import { AppointmentService } from '../../services/appointment.service';
import { UpdateAppointmentCommand } from '../commands/update-appointment.command';

export class UpdateAppointmentHandler
    implements CommandHandler<UpdateAppointmentCommand, AppointmentEntity> {
    constructor(private readonly appointmentService: AppointmentService) { }

    async execute(command: UpdateAppointmentCommand): Promise<AppointmentEntity> {
        return this.appointmentService.updateAppointment(command.id, command.data);
    }
}
