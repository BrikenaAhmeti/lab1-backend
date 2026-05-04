import { Command } from '../../../../shared/core/buses/command-bus';

export class DeleteAppointmentCommand implements Command {
    constructor(public readonly id: string) { }
}
