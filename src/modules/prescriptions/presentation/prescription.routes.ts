import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { PrescriptionController } from './prescription.controller';

const controller = new PrescriptionController();
const readRoles = ['DOCTOR', 'ADMIN', 'NURSE', 'RECEPTIONIST'];

export const prescriptionRoutes = Router();

prescriptionRoutes.use(authenticate);

prescriptionRoutes.get(
    '/',
    authorizeRoles(...readRoles),
    asyncHandler(controller.getAll.bind(controller)),
);
prescriptionRoutes.get(
    '/:id',
    authorizeRoles(...readRoles),
    asyncHandler(controller.getById.bind(controller)),
);
prescriptionRoutes.post(
    '/',
    authorizeRoles('DOCTOR', 'ADMIN'),
    asyncHandler(controller.create.bind(controller)),
);
prescriptionRoutes.put(
    '/:id',
    authorizeRoles('DOCTOR', 'ADMIN'),
    asyncHandler(controller.update.bind(controller)),
);
prescriptionRoutes.delete(
    '/:id',
    authorizeRoles('DOCTOR', 'ADMIN'),
    asyncHandler(controller.delete.bind(controller)),
);
