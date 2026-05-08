import { Request, Response } from 'express';
import { QueryBus } from '../../../shared/core/buses/query-bus';
import { GetDashboardActiveAdmissionsHandler } from '../application/handlers/get-dashboard-active-admissions.handler';
import { GetDashboardStatsHandler } from '../application/handlers/get-dashboard-stats.handler';
import { GetDashboardTodayAppointmentsHandler } from '../application/handlers/get-dashboard-today-appointments.handler';
import { GetDashboardActiveAdmissionsQuery } from '../application/queries/get-dashboard-active-admissions.query';
import { GetDashboardStatsQuery } from '../application/queries/get-dashboard-stats.query';
import { GetDashboardTodayAppointmentsQuery } from '../application/queries/get-dashboard-today-appointments.query';
import { DashboardPrismaRepository } from '../infrastructure/dashboard.prisma.repository';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
    private readonly queryBus = new QueryBus();
    private readonly repository = new DashboardPrismaRepository();
    private readonly service = new DashboardService(this.repository);

    async getStats(_req: Request, res: Response) {
        const handler = new GetDashboardStatsHandler(this.service);
        const query = new GetDashboardStatsQuery();
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getTodayAppointments(_req: Request, res: Response) {
        const handler = new GetDashboardTodayAppointmentsHandler(this.service);
        const query = new GetDashboardTodayAppointmentsQuery();
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getActiveAdmissions(_req: Request, res: Response) {
        const handler = new GetDashboardActiveAdmissionsHandler(this.service);
        const query = new GetDashboardActiveAdmissionsQuery();
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }
}
