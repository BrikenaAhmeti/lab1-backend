import { Command } from '../../../../shared/core/buses/command-bus';
import { CreatePrescriptionDto } from '../../dto/prescription.dto';

export class CreatePrescriptionCommand implements Command {
    constructor(public readonly data: CreatePrescriptionDto) { }
}
