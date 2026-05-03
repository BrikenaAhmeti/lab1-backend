import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import { DepartmentController } from './department.controller';

const controller = new DepartmentController();

export const departmentRoutes = Router();

departmentRoutes.use(authenticate);

departmentRoutes.get('/', (req, res) => controller.getAll(req, res));
departmentRoutes.post('/', (req, res) => controller.create(req, res));
departmentRoutes.get('/:id/doctors', (req, res) => controller.getDoctors(req, res));
departmentRoutes.get('/:id/rooms', (req, res) => controller.getRooms(req, res));
departmentRoutes.get('/:id', (req, res) => controller.getById(req, res));
departmentRoutes.put('/:id', (req, res) => controller.update(req, res));
departmentRoutes.delete('/:id', (req, res) => controller.delete(req, res));
