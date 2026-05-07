import { Query } from '../../../../shared/core/buses/query-bus';
import { GetInvoicesQueryDto } from '../../dto/invoice.dto';

export class GetInvoicesQuery implements Query {
    constructor(public readonly data: GetInvoicesQueryDto) { }
}
