import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { DoctorController } from './doctor.controller';

const controller = new DoctorController();

export const doctorRoutes = Router();

doctorRoutes.use(authenticate);

doctorRoutes.get('/', (req, res) => controller.getAll(req, res));
doctorRoutes.get('/:id', (req, res) => controller.getById(req, res));
doctorRoutes.post(
    '/',
    authorizeRoles('ADMIN'),
    (req, res) => controller.create(req, res),
);
doctorRoutes.put('/:id', (req, res) => controller.update(req, res));
doctorRoutes.delete(
    '/:id',
    authorizeRoles('ADMIN'),
    (req, res) => controller.delete(req, res),
);
