import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { PaginatedResponse } from '../../../../shared/core/pagination';
import { PrescriptionEntity } from '../../domain/prescription.entity';
import { PrescriptionService } from '../../services/prescription.service';
import { GetPrescriptionsQuery } from '../queries/get-prescriptions.query';

export class GetPrescriptionsHandler
    implements QueryHandler<
        GetPrescriptionsQuery,
        PaginatedResponse<PrescriptionEntity>
    > {
    constructor(private readonly prescriptionService: PrescriptionService) { }

    async execute(
        query: GetPrescriptionsQuery,
    ): Promise<PaginatedResponse<PrescriptionEntity>> {
        return this.prescriptionService.getPrescriptions(query.data);
    }
}
