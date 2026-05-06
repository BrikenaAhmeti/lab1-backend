import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { MedicalRecordEntity } from '../../domain/medical-record.entity';
import { MedicalRecordService } from '../../services/medical-record.service';
import { UpdateMedicalRecordCommand } from '../commands/update-medical-record.command';

export class UpdateMedicalRecordHandler
    implements CommandHandler<UpdateMedicalRecordCommand, MedicalRecordEntity> {
    constructor(private readonly medicalRecordService: MedicalRecordService) { }

    async execute(
        command: UpdateMedicalRecordCommand,
    ): Promise<MedicalRecordEntity> {
        return this.medicalRecordService.updateMedicalRecord(
            command.id,
            command.data,
        );
    }
}
