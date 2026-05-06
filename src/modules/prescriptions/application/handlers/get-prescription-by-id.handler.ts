import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { PrescriptionEntity } from '../../domain/prescription.entity';
import { PrescriptionService } from '../../services/prescription.service';
import { GetPrescriptionByIdQuery } from '../queries/get-prescription-by-id.query';

export class GetPrescriptionByIdHandler
    implements QueryHandler<GetPrescriptionByIdQuery, PrescriptionEntity> {
    constructor(private readonly prescriptionService: PrescriptionService) { }

    async execute(
        query: GetPrescriptionByIdQuery,
    ): Promise<PrescriptionEntity> {
        return this.prescriptionService.getPrescriptionById(query.id);
    }
}
