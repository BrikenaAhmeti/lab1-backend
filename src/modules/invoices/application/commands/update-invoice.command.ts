import { Command } from '../../../../shared/core/buses/command-bus';
import { UpdateInvoiceDto } from '../../dto/invoice.dto';

export class UpdateInvoiceCommand implements Command {
    constructor(
        public readonly id: string,
        public readonly data: UpdateInvoiceDto,
    ) { }
}
