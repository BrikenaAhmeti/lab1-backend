import { Command } from '../../../../shared/core/buses/command-bus';

export class DeleteNurseCommand implements Command {
    constructor(public readonly id: string) { }
}
