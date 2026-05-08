import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { AppointmentController } from './appointment.controller';

const controller = new AppointmentController();

export const appointmentRoutes = Router();

appointmentRoutes.use(authenticate);

appointmentRoutes.get('/', asyncHandler(controller.getAll.bind(controller)));
appointmentRoutes.get(
    '/today',
    asyncHandler(controller.getToday.bind(controller)),
);
appointmentRoutes.get('/:id', asyncHandler(controller.getById.bind(controller)));
appointmentRoutes.post('/', asyncHandler(controller.create.bind(controller)));
appointmentRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
appointmentRoutes.delete(
    '/:id',
    asyncHandler(controller.delete.bind(controller)),
);
