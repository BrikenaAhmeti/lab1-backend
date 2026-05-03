import { Query } from '../../../../shared/core/buses/query-bus';

export class GetDoctorByIdQuery implements Query {
    constructor(public readonly id: string) { }
}
