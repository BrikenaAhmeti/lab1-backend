import { Query } from '../../../../shared/core/buses/query-bus';
import { GetAllDepartmentsQueryDto } from '../../dto/department.dto';

export class GetAllDepartmentsQuery implements Query {
    constructor(public readonly data: GetAllDepartmentsQueryDto) { }
}
