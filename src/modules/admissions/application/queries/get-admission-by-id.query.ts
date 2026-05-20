import { Query } from '../../../../shared/core/buses/query-bus';

export class GetAdmissionByIdQuery implements Query {
    constructor(public readonly id: string) { }
}
