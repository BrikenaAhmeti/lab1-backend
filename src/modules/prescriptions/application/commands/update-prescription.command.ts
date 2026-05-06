import { Command } from '../../../../shared/core/buses/command-bus';
import { UpdatePrescriptionDto } from '../../dto/prescription.dto';

export class UpdatePrescriptionCommand implements Command {
    constructor(
        public readonly id: string,
        public readonly data: UpdatePrescriptionDto,
    ) { }
}
