import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { PaginatedResponse } from '../../../../shared/core/pagination';
import { AdmissionEntity } from '../../domain/admission.entity';
import { AdmissionService } from '../../services/admission.service';
import { GetActiveAdmissionsQuery } from '../queries/get-active-admissions.query';

export class GetActiveAdmissionsHandler
    implements QueryHandler<
        GetActiveAdmissionsQuery,
        PaginatedResponse<AdmissionEntity>
    > {
    constructor(private readonly admissionService: AdmissionService) { }

    async execute(
        query: GetActiveAdmissionsQuery,
    ): Promise<PaginatedResponse<AdmissionEntity>> {
        return this.admissionService.getActiveAdmissions(query.data);
    }
}
