import { Query } from '../../../../shared/core/buses/query-bus';
import { GetAdmissionsQueryDto } from '../../dto/admission.dto';

export class GetAdmissionsQuery implements Query {
    constructor(public readonly data: GetAdmissionsQueryDto) { }
}
