import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { PaginatedResponse } from '../../../../shared/core/pagination';
import { AppointmentEntity } from '../../domain/appointment.entity';
import { AppointmentService } from '../../services/appointment.service';
import { GetTodayAppointmentsQuery } from '../queries/get-today-appointments.query';

export class GetTodayAppointmentsHandler
    implements QueryHandler<
        GetTodayAppointmentsQuery,
        PaginatedResponse<AppointmentEntity>
    > {
    constructor(private readonly appointmentService: AppointmentService) { }

    async execute(
        query: GetTodayAppointmentsQuery,
    ): Promise<PaginatedResponse<AppointmentEntity>> {
        return this.appointmentService.getTodayAppointments(query.data);
    }
}
