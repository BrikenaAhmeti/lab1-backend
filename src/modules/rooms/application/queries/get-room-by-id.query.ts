import { Query } from '../../../../shared/core/buses/query-bus';

export class GetRoomByIdQuery implements Query {
    constructor(public readonly id: string) { }
}
