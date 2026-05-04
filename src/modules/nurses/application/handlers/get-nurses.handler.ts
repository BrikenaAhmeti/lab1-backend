import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { NurseEntity } from '../../domain/nurse.entity';
import { NurseService } from '../../services/nurse.service';
import { GetNursesQuery } from '../queries/get-nurses.query';

export class GetNursesHandler
    implements QueryHandler<GetNursesQuery, NurseEntity[]> {
    constructor(private readonly nurseService: NurseService) { }

    async execute(query: GetNursesQuery): Promise<NurseEntity[]> {
        return this.nurseService.getNurses({
            departmentId: query.departmentId,
        });
    }
}
