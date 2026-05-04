import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { AppointmentEntity } from '../../domain/appointment.entity';
import { AppointmentService } from '../../services/appointment.service';
import { GetAppointmentByIdQuery } from '../queries/get-appointment-by-id.query';

export class GetAppointmentByIdHandler
    implements QueryHandler<GetAppointmentByIdQuery, AppointmentEntity> {
    constructor(private readonly appointmentService: AppointmentService) { }

    async execute(query: GetAppointmentByIdQuery): Promise<AppointmentEntity> {
        return this.appointmentService.getAppointmentById(query.id);
    }
}
