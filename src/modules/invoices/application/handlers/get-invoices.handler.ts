import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { PaginatedResponse } from '../../../../shared/core/pagination';
import { InvoiceEntity } from '../../domain/invoice.entity';
import { InvoiceService } from '../../services/invoice.service';
import { GetInvoicesQuery } from '../queries/get-invoices.query';

export class GetInvoicesHandler
    implements QueryHandler<GetInvoicesQuery, PaginatedResponse<InvoiceEntity>> {
    constructor(private readonly invoiceService: InvoiceService) { }

    async execute(query: GetInvoicesQuery): Promise<PaginatedResponse<InvoiceEntity>> {
        return this.invoiceService.getInvoices(query.data);
    }
}
