import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { DepartmentEntity } from '../../domain/department.entity';
import { DepartmentService } from '../../services/department.service';
import { GetDepartmentsQuery } from '../queries/get-departments.query';

export class GetDepartmentsHandler
    implements QueryHandler<GetDepartmentsQuery, DepartmentEntity[]> {
    constructor(private readonly departmentService: DepartmentService) { }

    async execute(_query: GetDepartmentsQuery): Promise<DepartmentEntity[]> {
        return this.departmentService.getDepartments();
    }
}
