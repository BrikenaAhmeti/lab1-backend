import { QueryHandler } from '../../../shared/core/buses/query-bus';
import { PatientEntity } from '../domain/patient.entity';
import { PatientService } from '../services/patient.service';
import { GetPatientQuery } from './get-patient.query';

export class GetPatientHandler
    implements QueryHandler<GetPatientQuery, PatientEntity> {
    constructor(private readonly patientService: PatientService) { }

    async execute(query: GetPatientQuery): Promise<PatientEntity> {
        return this.patientService.getPatient(query.id);
    }
}
