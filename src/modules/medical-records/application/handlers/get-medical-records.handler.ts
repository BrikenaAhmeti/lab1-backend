import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { MedicalRecordEntity } from '../../domain/medical-record.entity';
import { MedicalRecordService } from '../../services/medical-record.service';
import { GetMedicalRecordsQuery } from '../queries/get-medical-records.query';

export class GetMedicalRecordsHandler
    implements QueryHandler<GetMedicalRecordsQuery, MedicalRecordEntity[]> {
    constructor(private readonly medicalRecordService: MedicalRecordService) { }

    async execute(query: GetMedicalRecordsQuery): Promise<MedicalRecordEntity[]> {
        return this.medicalRecordService.getMedicalRecords({
            patientId: query.patientId,
        });
    }
}
