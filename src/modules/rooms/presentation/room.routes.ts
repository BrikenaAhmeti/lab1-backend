import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { RoomController } from './room.controller';

const controller = new RoomController();

export const roomRoutes = Router();

roomRoutes.use(authenticate);

roomRoutes.get('/', (req, res) => controller.getAll(req, res));
roomRoutes.get('/available', (req, res) => controller.getAvailable(req, res));
roomRoutes.get('/:id', (req, res) => controller.getById(req, res));
roomRoutes.post(
    '/',
    authorizeRoles('ADMIN'),
    (req, res) => controller.create(req, res),
);
roomRoutes.put(
    '/:id',
    authorizeRoles('ADMIN'),
    (req, res) => controller.update(req, res),
);
roomRoutes.delete(
    '/:id',
    authorizeRoles('ADMIN'),
    (req, res) => controller.delete(req, res),
);
