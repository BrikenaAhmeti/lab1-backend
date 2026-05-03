import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { DepartmentDoctorEntity } from '../../domain/department.entity';
import { DepartmentService } from '../../services/department.service';
import { GetDepartmentDoctorsQuery } from '../queries/get-department-doctors.query';

export class GetDepartmentDoctorsHandler
    implements QueryHandler<GetDepartmentDoctorsQuery, DepartmentDoctorEntity[]> {
    constructor(private readonly departmentService: DepartmentService) { }

    async execute(
        query: GetDepartmentDoctorsQuery,
    ): Promise<DepartmentDoctorEntity[]> {
        return this.departmentService.getDepartmentDoctors(query.id);
    }
}
