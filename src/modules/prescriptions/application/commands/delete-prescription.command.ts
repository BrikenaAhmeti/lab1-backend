import { Command } from '../../../../shared/core/buses/command-bus';

export class DeletePrescriptionCommand implements Command {
    constructor(public readonly id: string) { }
}
