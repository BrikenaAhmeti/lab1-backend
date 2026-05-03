import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { DoctorEntity } from '../../domain/doctor.entity';
import { DoctorService } from '../../services/doctor.service';
import { GetDoctorsQuery } from '../queries/get-doctors.query';

export class GetDoctorsHandler
    implements QueryHandler<GetDoctorsQuery, DoctorEntity[]> {
    constructor(private readonly doctorService: DoctorService) { }

    async execute(_query: GetDoctorsQuery): Promise<DoctorEntity[]> {
        return this.doctorService.getDoctors();
    }
}
