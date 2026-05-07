import { Command } from '../../../../shared/core/buses/command-bus';
import { CreateInvoiceDto } from '../../dto/invoice.dto';

export class CreateInvoiceCommand implements Command {
    constructor(public readonly data: CreateInvoiceDto) { }
}
