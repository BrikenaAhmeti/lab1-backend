import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { PaginatedResponse } from '../../../../shared/core/pagination';
import { DoctorEntity } from '../../domain/doctor.entity';
import { DoctorService } from '../../services/doctor.service';
import { GetDoctorsQuery } from '../queries/get-doctors.query';

export class GetDoctorsHandler
    implements QueryHandler<GetDoctorsQuery, PaginatedResponse<DoctorEntity>> {
    constructor(private readonly doctorService: DoctorService) { }

    async execute(
        query: GetDoctorsQuery,
    ): Promise<PaginatedResponse<DoctorEntity>> {
        return this.doctorService.getDoctors(query.data);
    }
}
