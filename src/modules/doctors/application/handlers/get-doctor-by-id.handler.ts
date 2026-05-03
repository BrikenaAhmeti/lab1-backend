import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { DoctorEntity } from '../../domain/doctor.entity';
import { DoctorService } from '../../services/doctor.service';
import { GetDoctorByIdQuery } from '../queries/get-doctor-by-id.query';

export class GetDoctorByIdHandler
    implements QueryHandler<GetDoctorByIdQuery, DoctorEntity> {
    constructor(private readonly doctorService: DoctorService) { }

    async execute(query: GetDoctorByIdQuery): Promise<DoctorEntity> {
        return this.doctorService.getDoctorById(query.id);
    }
}
