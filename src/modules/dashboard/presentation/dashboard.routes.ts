import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { DashboardController } from './dashboard.controller';

const controller = new DashboardController();

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);

dashboardRoutes.get('/stats', asyncHandler(controller.getStats.bind(controller)));
dashboardRoutes.get(
    '/appointments/today',
    asyncHandler(controller.getTodayAppointments.bind(controller)),
);
dashboardRoutes.get(
    '/admissions/active',
    asyncHandler(controller.getActiveAdmissions.bind(controller)),
);
