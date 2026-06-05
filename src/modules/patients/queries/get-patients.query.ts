import { Query } from '../../../shared/core/buses/query-bus';
import { AuthenticatedUser } from '../../../shared/core/types/request-with-user';
import { GetPatientsQueryDto } from '../dto/patient.dto';

export class GetPatientsQuery implements Query {
    constructor(
        public readonly data: GetPatientsQueryDto,
        public readonly user?: AuthenticatedUser,
    ) { }
}
