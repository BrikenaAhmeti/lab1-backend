import { Command } from '../../../../shared/core/buses/command-bus';
import { UpdateMedicalRecordDto } from '../../dto/medical-record.dto';

export class UpdateMedicalRecordCommand implements Command {
    constructor(
        public readonly id: string,
        public readonly data: UpdateMedicalRecordDto,
    ) { }
}
