import { Query } from '../../../../shared/core/buses/query-bus';

export class GetDepartmentRoomsQuery implements Query {
    constructor(public readonly id: string) { }
}
