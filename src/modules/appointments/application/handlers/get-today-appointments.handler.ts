import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { AppointmentEntity } from '../../domain/appointment.entity';
import { AppointmentService } from '../../services/appointment.service';
import { GetTodayAppointmentsQuery } from '../queries/get-today-appointments.query';

export class GetTodayAppointmentsHandler
    implements QueryHandler<GetTodayAppointmentsQuery, AppointmentEntity[]> {
    constructor(private readonly appointmentService: AppointmentService) { }

    async execute(_query: GetTodayAppointmentsQuery): Promise<AppointmentEntity[]> {
        return this.appointmentService.getTodayAppointments();
    }
}
