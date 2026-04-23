import { Query } from '../../../shared/core/buses/query-bus';

export class GetPatientQuery implements Query {
    constructor(public readonly id: string) { }
}
