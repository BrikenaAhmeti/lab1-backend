import { Command } from '../../../shared/core/buses/command-bus';
import { CreatePatientDto } from '../dto/patient.dto';

export class CreatePatientCommand implements Command {
    constructor(public readonly data: CreatePatientDto) { }
}
