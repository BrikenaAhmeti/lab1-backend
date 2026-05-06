import { Query } from '../../../../shared/core/buses/query-bus';

export class GetMedicalRecordPrescriptionsQuery implements Query {
    constructor(public readonly id: string) { }
}
