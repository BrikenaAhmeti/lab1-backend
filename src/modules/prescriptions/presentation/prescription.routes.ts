import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { PrescriptionController } from './prescription.controller';

const controller = new PrescriptionController();

export const prescriptionRoutes = Router();

prescriptionRoutes.use(authenticate);

prescriptionRoutes.get('/', (req, res) => controller.getAll(req, res));
prescriptionRoutes.get('/:id', (req, res) => controller.getById(req, res));
prescriptionRoutes.post(
    '/',
    authorizeRoles('DOCTOR', 'ADMIN'),
    (req, res) => controller.create(req, res),
);
prescriptionRoutes.put(
    '/:id',
    authorizeRoles('DOCTOR', 'ADMIN'),
    (req, res) => controller.update(req, res),
);
prescriptionRoutes.delete(
    '/:id',
    authorizeRoles('DOCTOR', 'ADMIN'),
    (req, res) => controller.delete(req, res),
);
