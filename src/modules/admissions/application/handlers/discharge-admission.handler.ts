import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { AdmissionEntity } from '../../domain/admission.entity';
import { AdmissionService } from '../../services/admission.service';
import { DischargeAdmissionCommand } from '../commands/discharge-admission.command';

export class DischargeAdmissionHandler
    implements CommandHandler<DischargeAdmissionCommand, AdmissionEntity> {
    constructor(private readonly admissionService: AdmissionService) { }

    async execute(
        command: DischargeAdmissionCommand,
    ): Promise<AdmissionEntity> {
        return this.admissionService.dischargeAdmission(
            command.id,
            command.data,
        );
    }
}
