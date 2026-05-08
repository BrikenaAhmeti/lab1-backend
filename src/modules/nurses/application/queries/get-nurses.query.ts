import { Query } from '../../../../shared/core/buses/query-bus';
import { GetNursesQueryDto } from '../../dto/nurse.dto';

export class GetNursesQuery implements Query {
    constructor(public readonly data: GetNursesQueryDto) { }
}
