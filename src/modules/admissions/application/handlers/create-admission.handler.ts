import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { AdmissionEntity } from '../../domain/admission.entity';
import { AdmissionService } from '../../services/admission.service';
import { CreateAdmissionCommand } from '../commands/create-admission.command';

export class CreateAdmissionHandler
    implements CommandHandler<CreateAdmissionCommand, AdmissionEntity> {
    constructor(private readonly admissionService: AdmissionService) { }

    async execute(command: CreateAdmissionCommand): Promise<AdmissionEntity> {
        return this.admissionService.createAdmission(command.data);
    }
}
