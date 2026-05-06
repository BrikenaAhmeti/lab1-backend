import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { MedicalRecordService } from '../../services/medical-record.service';
import { DeleteMedicalRecordCommand } from '../commands/delete-medical-record.command';

export class DeleteMedicalRecordHandler
    implements CommandHandler<DeleteMedicalRecordCommand> {
    constructor(private readonly medicalRecordService: MedicalRecordService) { }

    async execute(command: DeleteMedicalRecordCommand): Promise<void> {
        await this.medicalRecordService.deleteMedicalRecord(command.id);
    }
}
