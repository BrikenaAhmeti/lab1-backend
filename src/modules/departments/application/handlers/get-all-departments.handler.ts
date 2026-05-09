import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { DepartmentEntity } from '../../domain/department.entity';
import { DepartmentService } from '../../services/department.service';
import { GetAllDepartmentsQuery } from '../queries/get-all-departments.query';

export class GetAllDepartmentsHandler
    implements QueryHandler<GetAllDepartmentsQuery, { data: DepartmentEntity[] }> {
    constructor(private readonly departmentService: DepartmentService) { }

    async execute(
        query: GetAllDepartmentsQuery,
    ): Promise<{ data: DepartmentEntity[] }> {
        return this.departmentService.getAllDepartments(query.data);
    }
}
