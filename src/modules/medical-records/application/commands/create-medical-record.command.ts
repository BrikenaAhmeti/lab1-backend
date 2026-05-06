import { Command } from '../../../../shared/core/buses/command-bus';
import { CreateMedicalRecordDto } from '../../dto/medical-record.dto';

export class CreateMedicalRecordCommand implements Command {
    constructor(public readonly data: CreateMedicalRecordDto) { }
}
