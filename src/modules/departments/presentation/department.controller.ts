import { Request, Response } from 'express';
import { CommandBus } from '../../../shared/core/buses/command-bus';
import { QueryBus } from '../../../shared/core/buses/query-bus';
import { DepartmentPrismaRepository } from '../infrastructure/department.prisma.repository';
import { DepartmentService } from '../services/department.service';
import { CreateDepartmentCommand } from '../application/commands/create-department.command';
import { CreateDepartmentHandler } from '../application/handlers/create-department.handler';
import { GetDepartmentByIdQuery } from '../application/queries/get-department-by-id.query';
import { GetDepartmentByIdHandler } from '../application/handlers/get-department-by-id.handler';
import {
    validateCreateDepartmentDto,
    validateDepartmentId,
    validateUpdateDepartmentDto,
} from '../dto/department.dto';
import { GetDepartmentsQuery } from '../application/queries/get-departments.query';
import { GetDepartmentsHandler } from '../application/handlers/get-departments.handler';
import { UpdateDepartmentHandler } from '../application/handlers/update-department.handler';
import { UpdateDepartmentCommand } from '../application/commands/update-department.command';
import { DeleteDepartmentHandler } from '../application/handlers/delete-department.handler';
import { DeleteDepartmentCommand } from '../application/commands/delete-department.command';
import { GetDepartmentDoctorsHandler } from '../application/handlers/get-department-doctors.handler';
import { GetDepartmentDoctorsQuery } from '../application/queries/get-department-doctors.query';
import { GetDepartmentRoomsHandler } from '../application/handlers/get-department-rooms.handler';
import { GetDepartmentRoomsQuery } from '../application/queries/get-department-rooms.query';

export class DepartmentController {
    private readonly commandBus = new CommandBus();
    private readonly queryBus = new QueryBus();
    private readonly repository = new DepartmentPrismaRepository();
    private readonly service = new DepartmentService(this.repository);

    async create(req: Request, res: Response) {
        const body = validateCreateDepartmentDto(req.body);

        const handler = new CreateDepartmentHandler(this.service);
        const command = new CreateDepartmentCommand(
            body.name,
            body.location,
            body.description,
        );

        const result = await this.commandBus.execute(handler, command);

        return res.status(201).json(result);
    }

    async getAll(_req: Request, res: Response) {
        const handler = new GetDepartmentsHandler(this.service);
        const query = new GetDepartmentsQuery();

        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getById(req: Request, res: Response) {
        const id = validateDepartmentId(req.params.id);
        const handler = new GetDepartmentByIdHandler(this.service);
        const query = new GetDepartmentByIdQuery(id);

        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async update(req: Request, res: Response) {
        const id = validateDepartmentId(req.params.id);
        const body = validateUpdateDepartmentDto(req.body);
        const handler = new UpdateDepartmentHandler(this.service);
        const command = new UpdateDepartmentCommand(id, body);

        const result = await this.commandBus.execute(handler, command);

        return res.status(200).json(result);
    }

    async delete(req: Request, res: Response) {
        const id = validateDepartmentId(req.params.id);
        const handler = new DeleteDepartmentHandler(this.service);
        const command = new DeleteDepartmentCommand(id);

        await this.commandBus.execute(handler, command);

        return res.status(204).send();
    }

    async getDoctors(req: Request, res: Response) {
        const id = validateDepartmentId(req.params.id);
        const handler = new GetDepartmentDoctorsHandler(this.service);
        const query = new GetDepartmentDoctorsQuery(id);

        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getRooms(req: Request, res: Response) {
        const id = validateDepartmentId(req.params.id);
        const handler = new GetDepartmentRoomsHandler(this.service);
        const query = new GetDepartmentRoomsQuery(id);

        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }
}
