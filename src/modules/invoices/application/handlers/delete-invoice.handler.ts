import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { InvoiceService } from '../../services/invoice.service';
import { DeleteInvoiceCommand } from '../commands/delete-invoice.command';

export class DeleteInvoiceHandler
    implements CommandHandler<DeleteInvoiceCommand> {
    constructor(private readonly invoiceService: InvoiceService) { }

    async execute(command: DeleteInvoiceCommand): Promise<void> {
        await this.invoiceService.cancelInvoice(command.id);
    }
}
