import { Query } from '../../../../shared/core/buses/query-bus';

export class GetInvoiceByIdQuery implements Query {
    constructor(public readonly id: string) { }
}
