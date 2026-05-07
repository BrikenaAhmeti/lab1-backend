import { Command } from '../../../../shared/core/buses/command-bus';
import { DischargeAdmissionDto } from '../../dto/admission.dto';

export class DischargeAdmissionCommand implements Command {
    constructor(
        public readonly id: string,
        public readonly data: DischargeAdmissionDto,
    ) { }
}
