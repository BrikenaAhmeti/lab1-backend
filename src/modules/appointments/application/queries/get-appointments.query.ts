import { Query } from '../../../../shared/core/buses/query-bus';
import { AppointmentStatus } from '../../domain/appointment.entity';

export class GetAppointmentsQuery implements Query {
    constructor(
        public readonly date?: string,
        public readonly doctorId?: string,
        public readonly patientId?: string,
        public readonly status?: AppointmentStatus,
    ) { }
}
