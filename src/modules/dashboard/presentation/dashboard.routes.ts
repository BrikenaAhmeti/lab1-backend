import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { DashboardController } from './dashboard.controller';
import { RoomController } from '../../rooms/presentation/room.controller';

const controller = new DashboardController();
const roomController = new RoomController();

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);

dashboardRoutes.get('/stats', asyncHandler(controller.getStats.bind(controller)));
dashboardRoutes.get(
    '/rooms/available',
    asyncHandler(roomController.getAvailable.bind(roomController)),
);
dashboardRoutes.get(
    '/appointments/today',
    asyncHandler(controller.getTodayAppointments.bind(controller)),
);
dashboardRoutes.get(
    '/admissions/active',
    asyncHandler(controller.getActiveAdmissions.bind(controller)),
);
