import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { InvoiceEntity } from '../../domain/invoice.entity';
import { InvoiceService } from '../../services/invoice.service';
import { PayInvoiceCommand } from '../commands/pay-invoice.command';

export class PayInvoiceHandler
    implements CommandHandler<PayInvoiceCommand, InvoiceEntity> {
    constructor(private readonly invoiceService: InvoiceService) { }

    async execute(command: PayInvoiceCommand): Promise<InvoiceEntity> {
        return this.invoiceService.payInvoice(command.id);
    }
}
