import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { PaginatedResponse } from '../../../../shared/core/pagination';
import { DepartmentEntity } from '../../domain/department.entity';
import { DepartmentService } from '../../services/department.service';
import { GetDepartmentsQuery } from '../queries/get-departments.query';

export class GetDepartmentsHandler
    implements QueryHandler<
        GetDepartmentsQuery,
        PaginatedResponse<DepartmentEntity>
    > {
    constructor(private readonly departmentService: DepartmentService) { }

    async execute(
        query: GetDepartmentsQuery,
    ): Promise<PaginatedResponse<DepartmentEntity>> {
        return this.departmentService.getDepartments(query.data);
    }
}
