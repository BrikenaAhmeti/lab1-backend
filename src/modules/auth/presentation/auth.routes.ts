import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';

const controller = new AuthController();

export const authRoutes = Router();

authRoutes.post('/register', (req, res) => controller.register(req, res));
authRoutes.post('/login', (req, res) => controller.login(req, res));
authRoutes.post('/refresh', (req, res) => controller.refresh(req, res));
authRoutes.post('/logout', (req, res) => controller.logout(req, res));

authRoutes.get('/me', authenticate, (req, res) => controller.me(req, res));

authRoutes.get(
    '/users',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.listUsers(req, res),
);
authRoutes.get(
    '/users/:id',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.getUserById(req, res),
);
authRoutes.post(
    '/users',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.createUser(req, res),
);
authRoutes.patch(
    '/users/:id',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.updateUser(req, res),
);
authRoutes.delete(
    '/users/:id',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.deleteUser(req, res),
);
authRoutes.patch(
    '/users/:id/status',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.setUserStatus(req, res),
);

authRoutes.get(
    '/roles',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.listRoles(req, res),
);
authRoutes.post(
    '/roles',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.createRole(req, res),
);
authRoutes.patch(
    '/roles/:roleId',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.updateRole(req, res),
);
authRoutes.delete(
    '/roles/:roleId',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.deleteRole(req, res),
);

authRoutes.get(
    '/users/:userId/roles',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.listUserRoles(req, res),
);
authRoutes.post(
    '/users/:userId/roles',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.assignRoleToUser(req, res),
);
authRoutes.put(
    '/users/:userId/roles',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.replaceUserRoles(req, res),
);
authRoutes.delete(
    '/users/:userId/roles/:roleId',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.removeRoleFromUser(req, res),
);

authRoutes.get(
    '/users/:userId/refresh-tokens',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.listUserRefreshTokens(req, res),
);
authRoutes.delete(
    '/users/:userId/refresh-tokens',
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res) => controller.revokeUserRefreshTokens(req, res),
);
