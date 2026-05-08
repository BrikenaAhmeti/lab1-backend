import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { NurseController } from './nurse.controller';

const controller = new NurseController();

export const nurseRoutes = Router();

nurseRoutes.use(authenticate);

nurseRoutes.get('/', asyncHandler(controller.getAll.bind(controller)));
nurseRoutes.get('/:id', asyncHandler(controller.getById.bind(controller)));
nurseRoutes.post(
    '/',
    authorizeRoles('ADMIN'),
    asyncHandler(controller.create.bind(controller)),
);
nurseRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
nurseRoutes.delete(
    '/:id',
    authorizeRoles('ADMIN'),
    asyncHandler(controller.delete.bind(controller)),
);
