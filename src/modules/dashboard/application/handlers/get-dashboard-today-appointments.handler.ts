import { QueryHandler } from '../../../../shared/core/buses/query-bus';
import { DashboardTodayAppointmentEntity } from '../../domain/dashboard.entity';
import { DashboardService } from '../../services/dashboard.service';
import { GetDashboardTodayAppointmentsQuery } from '../queries/get-dashboard-today-appointments.query';

export class GetDashboardTodayAppointmentsHandler
    implements QueryHandler<
        GetDashboardTodayAppointmentsQuery,
        DashboardTodayAppointmentEntity[]
    > {
    constructor(private readonly dashboardService: DashboardService) { }

    async execute(
        _query: GetDashboardTodayAppointmentsQuery,
    ): Promise<DashboardTodayAppointmentEntity[]> {
        return this.dashboardService.getTodayAppointments();
    }
}
