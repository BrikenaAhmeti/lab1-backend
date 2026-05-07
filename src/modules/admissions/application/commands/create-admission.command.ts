import { Command } from '../../../../shared/core/buses/command-bus';
import { CreateAdmissionDto } from '../../dto/admission.dto';

export class CreateAdmissionCommand implements Command {
    constructor(public readonly data: CreateAdmissionDto) { }
}
