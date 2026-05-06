import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { PrescriptionEntity } from '../../domain/prescription.entity';
import { PrescriptionService } from '../../services/prescription.service';
import { UpdatePrescriptionCommand } from '../commands/update-prescription.command';

export class UpdatePrescriptionHandler
    implements CommandHandler<UpdatePrescriptionCommand, PrescriptionEntity> {
    constructor(private readonly prescriptionService: PrescriptionService) { }

    async execute(
        command: UpdatePrescriptionCommand,
    ): Promise<PrescriptionEntity> {
        return this.prescriptionService.updatePrescription(
            command.id,
            command.data,
        );
    }
}
