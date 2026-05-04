import { Query } from '../../../../shared/core/buses/query-bus';

export class GetNursesQuery implements Query {
    constructor(public readonly departmentId?: string) { }
}
