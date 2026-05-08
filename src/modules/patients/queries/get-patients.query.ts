import { Query } from '../../../shared/core/buses/query-bus';
import { GetPatientsQueryDto } from '../dto/patient.dto';

export class GetPatientsQuery implements Query {
    constructor(public readonly data: GetPatientsQueryDto) { }
}
