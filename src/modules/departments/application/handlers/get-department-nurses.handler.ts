import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { DepartmentNurseEntity } from '../../domain/department.entity';
import { DepartmentService } from '../../services/department.service';
import { GetDepartmentNursesQuery } from '../queries/get-department-nurses.query';

export class GetDepartmentNursesHandler
    implements QueryHandler<GetDepartmentNursesQuery, DepartmentNurseEntity[]> {
    constructor(private readonly departmentService: DepartmentService) { }

    async execute(
        query: GetDepartmentNursesQuery,
    ): Promise<DepartmentNurseEntity[]> {
        return this.departmentService.getDepartmentNurses(query.id);
    }
}
