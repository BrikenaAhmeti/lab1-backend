import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { InvoiceController } from './invoice.controller';

const controller = new InvoiceController();

export const invoiceRoutes = Router();

invoiceRoutes.use(authenticate);

invoiceRoutes.get('/', asyncHandler(controller.getAll.bind(controller)));
invoiceRoutes.get('/stats', asyncHandler(controller.getStats.bind(controller)));
invoiceRoutes.get('/:id', asyncHandler(controller.getById.bind(controller)));
invoiceRoutes.post(
    '/',
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    asyncHandler(controller.create.bind(controller)),
);
invoiceRoutes.put(
    '/:id/pay',
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    asyncHandler(controller.pay.bind(controller)),
);
invoiceRoutes.put(
    '/:id',
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    asyncHandler(controller.update.bind(controller)),
);
invoiceRoutes.delete(
    '/:id',
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    asyncHandler(controller.delete.bind(controller)),
);
