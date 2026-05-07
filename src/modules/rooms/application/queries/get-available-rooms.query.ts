import { Query } from '../../../../shared/core/buses/query-bus';
import { GetRoomsQueryDto } from '../../dto/room.dto';

export class GetAvailableRoomsQuery implements Query {
    constructor(public readonly data: GetRoomsQueryDto) { }
}
