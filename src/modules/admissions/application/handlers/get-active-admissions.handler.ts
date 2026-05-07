import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { AdmissionEntity } from '../../domain/admission.entity';
import { AdmissionService } from '../../services/admission.service';
import { GetActiveAdmissionsQuery } from '../queries/get-active-admissions.query';

export class GetActiveAdmissionsHandler
    implements QueryHandler<GetActiveAdmissionsQuery, AdmissionEntity[]> {
    constructor(private readonly admissionService: AdmissionService) { }

    async execute(_query: GetActiveAdmissionsQuery): Promise<AdmissionEntity[]> {
        return this.admissionService.getActiveAdmissions();
    }
}
