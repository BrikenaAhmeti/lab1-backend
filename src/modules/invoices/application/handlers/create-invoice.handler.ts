import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { InvoiceEntity } from '../../domain/invoice.entity';
import { InvoiceService } from '../../services/invoice.service';
import { CreateInvoiceCommand } from '../commands/create-invoice.command';

export class CreateInvoiceHandler
    implements CommandHandler<CreateInvoiceCommand, InvoiceEntity> {
    constructor(private readonly invoiceService: InvoiceService) { }

    async execute(command: CreateInvoiceCommand): Promise<InvoiceEntity> {
        return this.invoiceService.createInvoice(command.data);
    }
}
