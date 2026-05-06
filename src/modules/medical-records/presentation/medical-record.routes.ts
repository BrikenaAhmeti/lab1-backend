import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { MedicalRecordController } from './medical-record.controller';

const controller = new MedicalRecordController();

export const medicalRecordRoutes = Router();

medicalRecordRoutes.use(authenticate);

medicalRecordRoutes.get('/', (req, res) => controller.getAll(req, res));
medicalRecordRoutes.get(
    '/:id/prescriptions',
    (req, res) => controller.getPrescriptions(req, res),
);
medicalRecordRoutes.get('/:id', (req, res) => controller.getById(req, res));
medicalRecordRoutes.post(
    '/',
    authorizeRoles('DOCTOR', 'ADMIN'),
    (req, res) => controller.create(req, res),
);
medicalRecordRoutes.put(
    '/:id',
    authorizeRoles('DOCTOR', 'ADMIN'),
    (req, res) => controller.update(req, res),
);
medicalRecordRoutes.delete(
    '/:id',
    authorizeRoles('DOCTOR', 'ADMIN'),
    (req, res) => controller.delete(req, res),
);
