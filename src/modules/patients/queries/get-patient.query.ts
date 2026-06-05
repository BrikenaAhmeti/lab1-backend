import { Query } from '../../../shared/core/buses/query-bus';
import { AuthenticatedUser } from '../../../shared/core/types/request-with-user';

export class GetPatientQuery implements Query {
    constructor(
        public readonly id: string,
        public readonly user?: AuthenticatedUser,
    ) { }
}
