import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { PrescriptionService } from '../../services/prescription.service';
import { DeletePrescriptionCommand } from '../commands/delete-prescription.command';

export class DeletePrescriptionHandler
    implements CommandHandler<DeletePrescriptionCommand> {
    constructor(private readonly prescriptionService: PrescriptionService) { }

    async execute(command: DeletePrescriptionCommand): Promise<void> {
        return this.prescriptionService.deletePrescription(command.id);
    }
}
