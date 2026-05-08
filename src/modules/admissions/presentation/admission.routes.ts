import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { AdmissionController } from './admission.controller';

const controller = new AdmissionController();

export const admissionRoutes = Router();

admissionRoutes.use(authenticate);

admissionRoutes.get('/', asyncHandler(controller.getAll.bind(controller)));
admissionRoutes.get(
    '/active',
    asyncHandler(controller.getActive.bind(controller)),
);
admissionRoutes.post(
    '/',
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    asyncHandler(controller.create.bind(controller)),
);
admissionRoutes.put(
    '/:id/discharge',
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    asyncHandler(controller.discharge.bind(controller)),
);
