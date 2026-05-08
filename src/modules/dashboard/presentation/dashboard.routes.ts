import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { DashboardController } from './dashboard.controller';

const controller = new DashboardController();

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);

dashboardRoutes.get('/stats', (req, res) => controller.getStats(req, res));
dashboardRoutes.get(
    '/appointments/today',
    (req, res) => controller.getTodayAppointments(req, res),
);
dashboardRoutes.get(
    '/admissions/active',
    (req, res) => controller.getActiveAdmissions(req, res),
);
