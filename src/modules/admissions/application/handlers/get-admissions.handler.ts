import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { AdmissionEntity } from '../../domain/admission.entity';
import { AdmissionService } from '../../services/admission.service';
import { GetAdmissionsQuery } from '../queries/get-admissions.query';

export class GetAdmissionsHandler
    implements QueryHandler<GetAdmissionsQuery, AdmissionEntity[]> {
    constructor(private readonly admissionService: AdmissionService) { }

    async execute(query: GetAdmissionsQuery): Promise<AdmissionEntity[]> {
        return this.admissionService.getAdmissions(query.data);
    }
}
