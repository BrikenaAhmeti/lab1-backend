import { Query } from '../../../../shared/core/buses/query-bus';
import { GetAppointmentsQueryDto } from '../../dto/appointment.dto';

export class GetTodayAppointmentsQuery implements Query {
    constructor(public readonly data: GetAppointmentsQueryDto) { }
}
