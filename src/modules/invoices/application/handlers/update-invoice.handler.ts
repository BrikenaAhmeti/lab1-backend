import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { InvoiceEntity } from '../../domain/invoice.entity';
import { InvoiceService } from '../../services/invoice.service';
import { UpdateInvoiceCommand } from '../commands/update-invoice.command';

export class UpdateInvoiceHandler
    implements CommandHandler<UpdateInvoiceCommand, InvoiceEntity> {
    constructor(private readonly invoiceService: InvoiceService) { }

    async execute(command: UpdateInvoiceCommand): Promise<InvoiceEntity> {
        return this.invoiceService.updateInvoice(command.id, command.data);
    }
}
