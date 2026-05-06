import { Query } from '../../../../shared/core/buses/query-bus';

export class GetMedicalRecordByIdQuery implements Query {
    constructor(public readonly id: string) { }
}
