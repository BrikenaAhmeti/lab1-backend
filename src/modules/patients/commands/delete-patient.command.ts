import { Command } from '../../../shared/core/buses/command-bus';

export class DeletePatientCommand implements Command {
    constructor(public readonly id: string) { }
}
