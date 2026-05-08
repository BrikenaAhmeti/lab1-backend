import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { PaginatedResponse } from '../../../../shared/core/pagination';
import { NurseEntity } from '../../domain/nurse.entity';
import { NurseService } from '../../services/nurse.service';
import { GetNursesQuery } from '../queries/get-nurses.query';

export class GetNursesHandler
    implements QueryHandler<GetNursesQuery, PaginatedResponse<NurseEntity>> {
    constructor(private readonly nurseService: NurseService) { }

    async execute(query: GetNursesQuery): Promise<PaginatedResponse<NurseEntity>> {
        return this.nurseService.getNurses(query.data);
    }
}
