import { Query } from '../../../../shared/core/buses/query-bus';
import { GetMedicalRecordsQueryDto } from '../../dto/medical-record.dto';

export class GetMedicalRecordsQuery implements Query {
    constructor(public readonly data: GetMedicalRecordsQueryDto) { }
}
