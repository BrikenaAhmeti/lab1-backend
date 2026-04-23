import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorizeRoles } from '../../shared/middleware/authorize-roles';
import { PatientsController } from './patients.controller';

const controller = new PatientsController();

export const patientRoutes = Router();

patientRoutes.use(authenticate);

patientRoutes.get('/', (req, res) => controller.getAll(req, res));
patientRoutes.get('/:id', (req, res) => controller.getById(req, res));
patientRoutes.post('/', (req, res) => controller.create(req, res));
patientRoutes.put('/:id', (req, res) => controller.update(req, res));
patientRoutes.delete(
    '/:id',
    authorizeRoles('ADMIN'),
    (req, res) => controller.delete(req, res),
);
