import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { MedicalRecordEntity } from '../../domain/medical-record.entity';
import { MedicalRecordService } from '../../services/medical-record.service';
import { GetMedicalRecordByIdQuery } from '../queries/get-medical-record-by-id.query';

export class GetMedicalRecordByIdHandler
    implements QueryHandler<GetMedicalRecordByIdQuery, MedicalRecordEntity> {
    constructor(private readonly medicalRecordService: MedicalRecordService) { }

    async execute(
        query: GetMedicalRecordByIdQuery,
    ): Promise<MedicalRecordEntity> {
        return this.medicalRecordService.getMedicalRecordById(query.id);
    }
}
