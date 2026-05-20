import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { AdmissionEntity } from '../../domain/admission.entity';
import { AdmissionService } from '../../services/admission.service';
import { GetAdmissionByIdQuery } from '../queries/get-admission-by-id.query';

export class GetAdmissionByIdHandler
    implements QueryHandler<GetAdmissionByIdQuery, AdmissionEntity> {
    constructor(private readonly admissionService: AdmissionService) { }

    async execute(query: GetAdmissionByIdQuery): Promise<AdmissionEntity> {
        return this.admissionService.getAdmissionById(query.id);
    }
}
