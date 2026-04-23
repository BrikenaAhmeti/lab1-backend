import { CommandHandler } from '../../../shared/core/buses/command-bus';
import { PatientEntity } from '../domain/patient.entity';
import { PatientService } from '../services/patient.service';
import { UpdatePatientCommand } from './update-patient.command';

export class UpdatePatientHandler
    implements CommandHandler<UpdatePatientCommand, PatientEntity> {
    constructor(private readonly patientService: PatientService) { }

    async execute(command: UpdatePatientCommand): Promise<PatientEntity> {
        return this.patientService.updatePatient(command.id, command.data);
    }
}
