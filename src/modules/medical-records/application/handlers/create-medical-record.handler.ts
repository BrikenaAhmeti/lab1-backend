import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { MedicalRecordEntity } from '../../domain/medical-record.entity';
import { MedicalRecordService } from '../../services/medical-record.service';
import { CreateMedicalRecordCommand } from '../commands/create-medical-record.command';

export class CreateMedicalRecordHandler
    implements CommandHandler<CreateMedicalRecordCommand, MedicalRecordEntity> {
    constructor(private readonly medicalRecordService: MedicalRecordService) { }

    async execute(
        command: CreateMedicalRecordCommand,
    ): Promise<MedicalRecordEntity> {
        return this.medicalRecordService.createMedicalRecord(command.data);
    }
}
