import { Request, Response } from 'express';
import { CommandBus } from '../../../shared/core/buses/command-bus';
import { QueryBus } from '../../../shared/core/buses/query-bus';
import { CreateAppointmentCommand } from '../application/commands/create-appointment.command';
import { DeleteAppointmentCommand } from '../application/commands/delete-appointment.command';
import { UpdateAppointmentCommand } from '../application/commands/update-appointment.command';
import { CreateAppointmentHandler } from '../application/handlers/create-appointment.handler';
import { DeleteAppointmentHandler } from '../application/handlers/delete-appointment.handler';
import { GetAppointmentByIdHandler } from '../application/handlers/get-appointment-by-id.handler';
import { GetAppointmentsHandler } from '../application/handlers/get-appointments.handler';
import { GetTodayAppointmentsHandler } from '../application/handlers/get-today-appointments.handler';
import { UpdateAppointmentHandler } from '../application/handlers/update-appointment.handler';
import {
    validateAppointmentId,
    validateCreateAppointmentDto,
    validateGetAppointmentsQueryDto,
    validateUpdateAppointmentDto,
} from '../dto/appointment.dto';
import { AppointmentPrismaRepository } from '../infrastructure/appointment.prisma.repository';
import { AppointmentService } from '../services/appointment.service';
import { GetAppointmentByIdQuery } from '../application/queries/get-appointment-by-id.query';
import { GetAppointmentsQuery } from '../application/queries/get-appointments.query';
import { GetTodayAppointmentsQuery } from '../application/queries/get-today-appointments.query';

export class AppointmentController {
    private readonly commandBus = new CommandBus();
    private readonly queryBus = new QueryBus();
    private readonly repository = new AppointmentPrismaRepository();
    private readonly service = new AppointmentService(this.repository);

    async create(req: Request, res: Response) {
        const body = validateCreateAppointmentDto(req.body);
        const handler = new CreateAppointmentHandler(this.service);
        const command = new CreateAppointmentCommand(body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(201).json(result);
    }

    async getAll(req: Request, res: Response) {
        const queryData = validateGetAppointmentsQueryDto(req.query);
        const handler = new GetAppointmentsHandler(this.service);
        const query = new GetAppointmentsQuery(
            queryData.date,
            queryData.doctorId,
            queryData.patientId,
            queryData.status,
        );
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getToday(_req: Request, res: Response) {
        const handler = new GetTodayAppointmentsHandler(this.service);
        const query = new GetTodayAppointmentsQuery();
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getById(req: Request, res: Response) {
        const id = validateAppointmentId(req.params.id);
        const handler = new GetAppointmentByIdHandler(this.service);
        const query = new GetAppointmentByIdQuery(id);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async update(req: Request, res: Response) {
        const id = validateAppointmentId(req.params.id);
        const body = validateUpdateAppointmentDto(req.body);
        const handler = new UpdateAppointmentHandler(this.service);
        const command = new UpdateAppointmentCommand(id, body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(200).json(result);
    }

    async delete(req: Request, res: Response) {
        const id = validateAppointmentId(req.params.id);
        const handler = new DeleteAppointmentHandler(this.service);
        const command = new DeleteAppointmentCommand(id);

        await this.commandBus.execute(handler, command);

        return res.status(204).send();
    }
}
