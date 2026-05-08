import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { DashboardStatsEntity } from '../../domain/dashboard.entity';
import { DashboardService } from '../../services/dashboard.service';
import { GetDashboardStatsQuery } from '../queries/get-dashboard-stats.query';

export class GetDashboardStatsHandler
    implements QueryHandler<GetDashboardStatsQuery, DashboardStatsEntity> {
    constructor(private readonly dashboardService: DashboardService) { }

    async execute(_query: GetDashboardStatsQuery): Promise<DashboardStatsEntity> {
        return this.dashboardService.getStats();
    }
}
