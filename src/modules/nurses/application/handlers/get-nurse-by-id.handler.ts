import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { NurseEntity } from '../../domain/nurse.entity';
import { NurseService } from '../../services/nurse.service';
import { GetNurseByIdQuery } from '../queries/get-nurse-by-id.query';

export class GetNurseByIdHandler
    implements QueryHandler<GetNurseByIdQuery, NurseEntity> {
    constructor(private readonly nurseService: NurseService) { }

    async execute(query: GetNurseByIdQuery): Promise<NurseEntity> {
        return this.nurseService.getNurseById(query.id);
    }
}
