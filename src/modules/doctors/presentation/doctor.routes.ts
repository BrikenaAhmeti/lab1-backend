import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { DoctorController } from './doctor.controller';

const controller = new DoctorController();

export const doctorRoutes = Router();

doctorRoutes.use(authenticate);

doctorRoutes.get('/', asyncHandler(controller.getAll.bind(controller)));
doctorRoutes.get('/:id', asyncHandler(controller.getById.bind(controller)));
doctorRoutes.post(
    '/',
    authorizeRoles('ADMIN'),
    asyncHandler(controller.create.bind(controller)),
);
doctorRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
doctorRoutes.delete(
    '/:id',
    authorizeRoles('ADMIN'),
    asyncHandler(controller.delete.bind(controller)),
);
