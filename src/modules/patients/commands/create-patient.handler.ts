import { CommandHandler } from '../../../shared/core/buses/command-bus';
import { PatientEntity } from '../domain/patient.entity';
import { PatientService } from '../services/patient.service';
import { CreatePatientCommand } from './create-patient.command';

export class CreatePatientHandler
    implements CommandHandler<CreatePatientCommand, PatientEntity> {
    constructor(private readonly patientService: PatientService) { }

    async execute(command: CreatePatientCommand): Promise<PatientEntity> {
        return this.patientService.createPatient(command.data);
    }
}
