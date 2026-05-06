import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { PrescriptionEntity } from '../../domain/prescription.entity';
import { PrescriptionService } from '../../services/prescription.service';
import { GetPrescriptionsQuery } from '../queries/get-prescriptions.query';

export class GetPrescriptionsHandler
    implements QueryHandler<GetPrescriptionsQuery, PrescriptionEntity[]> {
    constructor(private readonly prescriptionService: PrescriptionService) { }

    async execute(query: GetPrescriptionsQuery): Promise<PrescriptionEntity[]> {
        return this.prescriptionService.getPrescriptions({
            medicalRecordId: query.medicalRecordId,
        });
    }
}
