import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { InvoiceStatsEntity } from '../../domain/invoice.entity';
import { InvoiceService } from '../../services/invoice.service';
import { GetInvoiceStatsQuery } from '../queries/get-invoice-stats.query';

export class GetInvoiceStatsHandler
    implements QueryHandler<GetInvoiceStatsQuery, InvoiceStatsEntity> {
    constructor(private readonly invoiceService: InvoiceService) { }

    async execute(_query: GetInvoiceStatsQuery): Promise<InvoiceStatsEntity> {
        return this.invoiceService.getInvoiceStats();
    }
}
