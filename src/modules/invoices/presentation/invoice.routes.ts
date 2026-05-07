import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { authorizeRoles } from '../../../shared/middleware/authorize-roles';
import { InvoiceController } from './invoice.controller';

const controller = new InvoiceController();

export const invoiceRoutes = Router();

invoiceRoutes.use(authenticate);

invoiceRoutes.get('/', (req, res) => controller.getAll(req, res));
invoiceRoutes.get('/stats', (req, res) => controller.getStats(req, res));
invoiceRoutes.get('/:id', (req, res) => controller.getById(req, res));
invoiceRoutes.post(
    '/',
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    (req, res) => controller.create(req, res),
);
invoiceRoutes.put(
    '/:id/pay',
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    (req, res) => controller.pay(req, res),
);
invoiceRoutes.put(
    '/:id',
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    (req, res) => controller.update(req, res),
);
invoiceRoutes.delete(
    '/:id',
    authorizeRoles('ADMIN', 'RECEPTIONIST'),
    (req, res) => controller.delete(req, res),
);
