import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { NurseController } from './nurse.controller';

const controller = new NurseController();

export const nurseRoutes = Router();

nurseRoutes.use(authenticate);

nurseRoutes.get('/', (req, res) => controller.getAll(req, res));
nurseRoutes.get('/:id', (req, res) => controller.getById(req, res));
nurseRoutes.post(
    '/',
    authorizeRoles('ADMIN'),
    (req, res) => controller.create(req, res),
);
nurseRoutes.put('/:id', (req, res) => controller.update(req, res));
nurseRoutes.delete(
    '/:id',
    authorizeRoles('ADMIN'),
    (req, res) => controller.delete(req, res),
);
