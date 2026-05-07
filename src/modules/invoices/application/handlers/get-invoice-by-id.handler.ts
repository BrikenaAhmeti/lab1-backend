import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { InvoiceEntity } from '../../domain/invoice.entity';
import { InvoiceService } from '../../services/invoice.service';
import { GetInvoiceByIdQuery } from '../queries/get-invoice-by-id.query';

export class GetInvoiceByIdHandler
    implements QueryHandler<GetInvoiceByIdQuery, InvoiceEntity> {
    constructor(private readonly invoiceService: InvoiceService) { }

    async execute(query: GetInvoiceByIdQuery): Promise<InvoiceEntity> {
        return this.invoiceService.getInvoiceById(query.id);
    }
}
