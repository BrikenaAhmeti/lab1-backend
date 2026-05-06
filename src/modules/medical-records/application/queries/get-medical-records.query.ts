import { Query } from '../../../../shared/core/buses/query-bus';

export class GetMedicalRecordsQuery implements Query {
    constructor(public readonly patientId: string) { }
}
