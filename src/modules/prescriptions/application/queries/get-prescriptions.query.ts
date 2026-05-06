import { Query } from '../../../../shared/core/buses/query-bus';

export class GetPrescriptionsQuery implements Query {
    constructor(public readonly medicalRecordId: string) { }
}
