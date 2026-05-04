import { Query } from '../../../../shared/core/buses/query-bus';

export class GetDepartmentNursesQuery implements Query {
    constructor(public readonly id: string) { }
}
