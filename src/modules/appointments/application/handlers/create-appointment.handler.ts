import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { AppointmentEntity } from '../../domain/appointment.entity';
import { AppointmentService } from '../../services/appointment.service';
import { CreateAppointmentCommand } from '../commands/create-appointment.command';

export class CreateAppointmentHandler
    implements CommandHandler<CreateAppointmentCommand, AppointmentEntity> {
    constructor(private readonly appointmentService: AppointmentService) { }

    async execute(command: CreateAppointmentCommand): Promise<AppointmentEntity> {
        return this.appointmentService.createAppointment(command.data);
    }
}
