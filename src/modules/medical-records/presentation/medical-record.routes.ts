import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { MedicalRecordController } from './medical-record.controller';

const controller = new MedicalRecordController();

export const medicalRecordRoutes = Router();

medicalRecordRoutes.use(authenticate);

medicalRecordRoutes.get('/', asyncHandler(controller.getAll.bind(controller)));
medicalRecordRoutes.get(
    '/:id/prescriptions',
    asyncHandler(controller.getPrescriptions.bind(controller)),
);
medicalRecordRoutes.get(
    '/:id',
    asyncHandler(controller.getById.bind(controller)),
);
medicalRecordRoutes.post(
    '/',
    authorizeRoles('DOCTOR', 'ADMIN'),
    asyncHandler(controller.create.bind(controller)),
);
medicalRecordRoutes.put(
    '/:id',
    authorizeRoles('DOCTOR', 'ADMIN'),
    asyncHandler(controller.update.bind(controller)),
);
medicalRecordRoutes.delete(
    '/:id',
    authorizeRoles('DOCTOR', 'ADMIN'),
    asyncHandler(controller.delete.bind(controller)),
);
