import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { AppointmentEntity } from '../../domain/appointment.entity';
import { AppointmentService } from '../../services/appointment.service';
import { GetAppointmentsQuery } from '../queries/get-appointments.query';

export class GetAppointmentsHandler
    implements QueryHandler<GetAppointmentsQuery, AppointmentEntity[]> {
    constructor(private readonly appointmentService: AppointmentService) { }

    async execute(query: GetAppointmentsQuery): Promise<AppointmentEntity[]> {
        return this.appointmentService.getAppointments({
            date: query.date,
            doctorId: query.doctorId,
            patientId: query.patientId,
            status: query.status,
        });
    }
}
