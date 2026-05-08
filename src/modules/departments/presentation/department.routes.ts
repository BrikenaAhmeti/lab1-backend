import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { DepartmentController } from './department.controller';

const controller = new DepartmentController();

export const departmentRoutes = Router();

departmentRoutes.use(authenticate);

departmentRoutes.get('/', asyncHandler(controller.getAll.bind(controller)));
departmentRoutes.post('/', asyncHandler(controller.create.bind(controller)));
departmentRoutes.get(
    '/:id/doctors',
    asyncHandler(controller.getDoctors.bind(controller)),
);
departmentRoutes.get(
    '/:id/rooms',
    asyncHandler(controller.getRooms.bind(controller)),
);
departmentRoutes.get(
    '/:id/nurses',
    asyncHandler(controller.getNurses.bind(controller)),
);
departmentRoutes.get('/:id', asyncHandler(controller.getById.bind(controller)));
departmentRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
departmentRoutes.delete('/:id', asyncHandler(controller.delete.bind(controller)));
