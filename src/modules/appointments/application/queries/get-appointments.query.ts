import { Query } from '../../../../shared/core/buses/query-bus';
import { GetAppointmentsQueryDto } from '../../dto/appointment.dto';

export class GetAppointmentsQuery implements Query {
    constructor(public readonly data: GetAppointmentsQueryDto) { }
}
