import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { PrescriptionEntity } from '../../domain/prescription.entity';
import { PrescriptionService } from '../../services/prescription.service';
import { CreatePrescriptionCommand } from '../commands/create-prescription.command';

export class CreatePrescriptionHandler
    implements CommandHandler<CreatePrescriptionCommand, PrescriptionEntity> {
    constructor(private readonly prescriptionService: PrescriptionService) { }

    async execute(
        command: CreatePrescriptionCommand,
    ): Promise<PrescriptionEntity> {
        return this.prescriptionService.createPrescription(command.data);
    }
}
