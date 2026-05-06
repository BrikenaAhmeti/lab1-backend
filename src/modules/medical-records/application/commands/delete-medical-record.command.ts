import { Command } from '../../../../shared/core/buses/command-bus';

export class DeleteMedicalRecordCommand implements Command {
    constructor(public readonly id: string) { }
}
