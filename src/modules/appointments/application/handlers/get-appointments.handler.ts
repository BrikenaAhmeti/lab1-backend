import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { PaginatedResponse } from '../../../../shared/core/pagination';
import { AppointmentEntity } from '../../domain/appointment.entity';
import { AppointmentService } from '../../services/appointment.service';
import { GetAppointmentsQuery } from '../queries/get-appointments.query';

export class GetAppointmentsHandler
    implements QueryHandler<
        GetAppointmentsQuery,
        PaginatedResponse<AppointmentEntity>
    > {
    constructor(private readonly appointmentService: AppointmentService) { }

    async execute(
        query: GetAppointmentsQuery,
    ): Promise<PaginatedResponse<AppointmentEntity>> {
        return this.appointmentService.getAppointments(query.data);
    }
}
