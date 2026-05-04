import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { AppointmentController } from './appointment.controller';

const controller = new AppointmentController();

export const appointmentRoutes = Router();

appointmentRoutes.use(authenticate);

appointmentRoutes.get('/', (req, res) => controller.getAll(req, res));
appointmentRoutes.get('/today', (req, res) => controller.getToday(req, res));
appointmentRoutes.get('/:id', (req, res) => controller.getById(req, res));
appointmentRoutes.post('/', (req, res) => controller.create(req, res));
appointmentRoutes.put('/:id', (req, res) => controller.update(req, res));
appointmentRoutes.delete('/:id', (req, res) => controller.delete(req, res));
