import { Command } from '../../../../shared/core/buses/command-bus';

export class DeleteDoctorCommand implements Command {
    constructor(public readonly id: string) { }
}
