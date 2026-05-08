import { Query } from '../../../../shared/core/buses/query-bus';
import { GetDepartmentsQueryDto } from '../../dto/department.dto';

export class GetDepartmentsQuery implements Query {
    constructor(public readonly data: GetDepartmentsQueryDto) { }
}
