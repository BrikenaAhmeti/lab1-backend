import { Command } from '../../../../shared/core/buses/command-bus';

export class DeleteDepartmentCommand implements Command {
    constructor(public readonly id: string) { }
}
