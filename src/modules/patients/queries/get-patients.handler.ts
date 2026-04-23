import { QueryHandler } from '../../../shared/core/buses/query-bus';
import { PatientListResponse } from '../domain/patient.entity';
import { PatientService } from '../services/patient.service';
import { GetPatientsQuery } from './get-patients.query';

export class GetPatientsHandler
    implements QueryHandler<GetPatientsQuery, PatientListResponse> {
    constructor(private readonly patientService: PatientService) { }

    async execute(query: GetPatientsQuery): Promise<PatientListResponse> {
        return this.patientService.getPatients({
            page: query.page,
            limit: query.limit,
            search: query.search,
        });
    }
}
