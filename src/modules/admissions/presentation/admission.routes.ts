import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { AdmissionController } from './admission.controller';

const controller = new AdmissionController();

export const admissionRoutes = Router();

admissionRoutes.use(authenticate);

admissionRoutes.get('/', (req, res) => controller.getAll(req, res));
admissionRoutes.get('/active', (req, res) => controller.getActive(req, res));
admissionRoutes.post(
    '/',
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    (req, res) => controller.create(req, res),
);
admissionRoutes.put(
    '/:id/discharge',
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    (req, res) => controller.discharge(req, res),
);
