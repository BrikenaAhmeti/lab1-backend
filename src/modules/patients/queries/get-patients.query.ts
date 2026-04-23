import { Query } from '../../../shared/core/buses/query-bus';

export class GetPatientsQuery implements Query {
    constructor(
        public readonly page: number,
        public readonly limit: number,
        public readonly search?: string,
    ) { }
}
