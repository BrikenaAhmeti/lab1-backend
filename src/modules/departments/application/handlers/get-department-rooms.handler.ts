import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { DepartmentRoomEntity } from '../../domain/department.entity';
import { DepartmentService } from '../../services/department.service';
import { GetDepartmentRoomsQuery } from '../queries/get-department-rooms.query';

export class GetDepartmentRoomsHandler
    implements QueryHandler<GetDepartmentRoomsQuery, DepartmentRoomEntity[]> {
    constructor(private readonly departmentService: DepartmentService) { }

    async execute(
        query: GetDepartmentRoomsQuery,
    ): Promise<DepartmentRoomEntity[]> {
        return this.departmentService.getDepartmentRooms(query.id);
    }
}
