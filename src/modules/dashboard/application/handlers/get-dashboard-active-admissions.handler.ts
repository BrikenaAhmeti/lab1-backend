import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { DashboardActiveAdmissionEntity } from '../../domain/dashboard.entity';
import { DashboardService } from '../../services/dashboard.service';
import { GetDashboardActiveAdmissionsQuery } from '../queries/get-dashboard-active-admissions.query';

export class GetDashboardActiveAdmissionsHandler
    implements QueryHandler<
        GetDashboardActiveAdmissionsQuery,
        DashboardActiveAdmissionEntity[]
    > {
    constructor(private readonly dashboardService: DashboardService) { }

    async execute(
        _query: GetDashboardActiveAdmissionsQuery,
    ): Promise<DashboardActiveAdmissionEntity[]> {
        return this.dashboardService.getActiveAdmissions();
    }
}
