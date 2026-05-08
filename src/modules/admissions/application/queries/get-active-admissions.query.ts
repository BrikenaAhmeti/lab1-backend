import { Query } from '../../../../shared/core/buses/query-bus';
import { GetAdmissionsQueryDto } from '../../dto/admission.dto';

export class GetActiveAdmissionsQuery implements Query {
    constructor(public readonly data: GetAdmissionsQueryDto) { }
}
