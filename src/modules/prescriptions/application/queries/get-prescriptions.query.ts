import { Query } from '../../../../shared/core/buses/query-bus';
import { GetPrescriptionsQueryDto } from '../../dto/prescription.dto';

export class GetPrescriptionsQuery implements Query {
    constructor(public readonly data: GetPrescriptionsQueryDto) { }
}
