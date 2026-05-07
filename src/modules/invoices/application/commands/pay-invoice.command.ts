import { Command } from '../../../../shared/core/buses/command-bus';

export class PayInvoiceCommand implements Command {
    constructor(public readonly id: string) { }
}
