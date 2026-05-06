import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { MedicalRecordPrescriptionEntity } from '../../domain/medical-record.entity';
import { MedicalRecordService } from '../../services/medical-record.service';
import { GetMedicalRecordPrescriptionsQuery } from '../queries/get-medical-record-prescriptions.query';

export class GetMedicalRecordPrescriptionsHandler
    implements QueryHandler<
        GetMedicalRecordPrescriptionsQuery,
        MedicalRecordPrescriptionEntity[]
    > {
    constructor(private readonly medicalRecordService: MedicalRecordService) { }

    async execute(
        query: GetMedicalRecordPrescriptionsQuery,
    ): Promise<MedicalRecordPrescriptionEntity[]> {
        return this.medicalRecordService.getMedicalRecordPrescriptions(query.id);
    }
}
