import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { RoomController } from './room.controller';

const controller = new RoomController();

export const roomRoutes = Router();

roomRoutes.use(authenticate);

roomRoutes.get('/', asyncHandler(controller.getAll.bind(controller)));
roomRoutes.get(
    '/available',
    asyncHandler(controller.getAvailable.bind(controller)),
);
roomRoutes.get('/:id', asyncHandler(controller.getById.bind(controller)));
roomRoutes.post(
    '/',
    authorizeRoles('ADMIN'),
    asyncHandler(controller.create.bind(controller)),
);
roomRoutes.put(
    '/:id',
    authorizeRoles('ADMIN'),
    asyncHandler(controller.update.bind(controller)),
);
roomRoutes.delete(
    '/:id',
    authorizeRoles('ADMIN'),
    asyncHandler(controller.delete.bind(controller)),
);
