import { Query } from '../../../../shared/core/buses/query-bus';
import { GetDoctorsQueryDto } from '../../dto/doctor.dto';

export class GetDoctorsQuery implements Query {
    constructor(public readonly data: GetDoctorsQueryDto) { }
}
