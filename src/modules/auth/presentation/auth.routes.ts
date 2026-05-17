import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { asyncHandler } from '../../../shared/utils/async-handler';

const controller = new AuthController();

export const authRoutes = Router();

authRoutes.post('/register', asyncHandler(controller.register.bind(controller)));
authRoutes.post('/login', asyncHandler(controller.login.bind(controller)));
authRoutes.post('/refresh', asyncHandler(controller.refresh.bind(controller)));
authRoutes.post('/confirm-email', asyncHandler(controller.confirmEmail.bind(controller)));
authRoutes.post(
    '/resend-confirmation-email',
    asyncHandler(controller.resendConfirmationEmail.bind(controller)),
);
authRoutes.post('/logout', asyncHandler(controller.logout.bind(controller)));
authRoutes.post(
    '/change-password',
    authenticate,
    asyncHandler(controller.changePassword.bind(controller)),
);
authRoutes.post(
    '/logout-all',
    authenticate,
    asyncHandler(controller.logoutAll.bind(controller)),
);

authRoutes.get('/me', authenticate, asyncHandler(controller.me.bind(controller)));

authRoutes.get(
    '/users',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.listUsers.bind(controller)),
);
authRoutes.get(
    '/users/:id',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.getUserById.bind(controller)),
);
authRoutes.post(
    '/users',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.createUser.bind(controller)),
);
authRoutes.post(
    '/users/receptionists',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.createReceptionist.bind(controller)),
);
authRoutes.patch(
    '/users/:id',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.updateUser.bind(controller)),
);
authRoutes.delete(
    '/users/:id',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.deleteUser.bind(controller)),
);
authRoutes.patch(
    '/users/:id/status',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.setUserStatus.bind(controller)),
);
authRoutes.patch(
    '/users/:id/password',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.setUserPassword.bind(controller)),
);

authRoutes.get(
    '/roles',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.listRoles.bind(controller)),
);
authRoutes.post(
    '/roles',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.createRole.bind(controller)),
);
authRoutes.patch(
    '/roles/:roleId',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.updateRole.bind(controller)),
);
authRoutes.delete(
    '/roles/:roleId',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.deleteRole.bind(controller)),
);

authRoutes.get(
    '/users/:userId/roles',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.listUserRoles.bind(controller)),
);
authRoutes.post(
    '/users/:userId/roles',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.assignRoleToUser.bind(controller)),
);
authRoutes.put(
    '/users/:userId/roles',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.replaceUserRoles.bind(controller)),
);
authRoutes.delete(
    '/users/:userId/roles/:roleId',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.removeRoleFromUser.bind(controller)),
);

authRoutes.get(
    '/users/:userId/refresh-tokens',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.listUserRefreshTokens.bind(controller)),
);
authRoutes.delete(
    '/users/:userId/refresh-tokens',
    authenticate,
    authorizeRoles('ADMIN'),
    asyncHandler(controller.revokeUserRefreshTokens.bind(controller)),
);
