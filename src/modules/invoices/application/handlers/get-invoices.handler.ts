import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { InvoiceEntity } from '../../domain/invoice.entity';
import { InvoiceService } from '../../services/invoice.service';
import { GetInvoicesQuery } from '../queries/get-invoices.query';

export class GetInvoicesHandler
    implements QueryHandler<GetInvoicesQuery, InvoiceEntity[]> {
    constructor(private readonly invoiceService: InvoiceService) { }

    async execute(query: GetInvoicesQuery): Promise<InvoiceEntity[]> {
        return this.invoiceService.getInvoices(query.data);
    }
}
