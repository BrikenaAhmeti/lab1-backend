import { CommandHandler } from '../../../shared/core/buses/command-bus';
import { PatientService } from '../services/patient.service';
import { DeletePatientCommand } from './delete-patient.command';

export class DeletePatientHandler
    implements CommandHandler<DeletePatientCommand, void> {
    constructor(private readonly patientService: PatientService) { }

    async execute(command: DeletePatientCommand): Promise<void> {
        await this.patientService.deletePatient(command.id);
    }
}
