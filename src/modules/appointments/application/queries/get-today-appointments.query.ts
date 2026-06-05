import { Query } from '../../../../shared/core/buses/query-bus';
import { AuthenticatedUser } from '../../../../shared/core/types/request-with-user';
import { GetAppointmentsQueryDto } from '../../dto/appointment.dto';

export class GetTodayAppointmentsQuery implements Query {
    constructor(
        public readonly data: GetAppointmentsQueryDto,
        public readonly user?: AuthenticatedUser,
    ) { }
}
