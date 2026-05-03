import { Query } from '../../../../shared/core/buses/query-bus';

export class GetDepartmentDoctorsQuery implements Query {
    constructor(public readonly id: string) { }
}
