import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorizeRoles } from '../../shared/middleware/authorize-roles';
import { asyncHandler } from '../../shared/utils/async-handler';
import { PatientsController } from './patients.controller';

const controller = new PatientsController();

export const patientRoutes = Router();

patientRoutes.use(authenticate);

patientRoutes.get('/', asyncHandler(controller.getAll.bind(controller)));
patientRoutes.get('/:id', asyncHandler(controller.getById.bind(controller)));
patientRoutes.post('/', asyncHandler(controller.create.bind(controller)));
patientRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
patientRoutes.delete(
    '/:id',
    authorizeRoles('ADMIN'),
    asyncHandler(controller.delete.bind(controller)),
);
