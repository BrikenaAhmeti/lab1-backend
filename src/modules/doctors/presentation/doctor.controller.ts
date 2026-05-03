import { Request, Response } from 'express';
import { CommandBus } from '../../../shared/core/buses/command-bus';
import { QueryBus } from '../../../shared/core/buses/query-bus';
import { CreateDoctorCommand } from '../application/commands/create-doctor.command';
import { DeleteDoctorCommand } from '../application/commands/delete-doctor.command';
import { UpdateDoctorCommand } from '../application/commands/update-doctor.command';
import { CreateDoctorHandler } from '../application/handlers/create-doctor.handler';
import { DeleteDoctorHandler } from '../application/handlers/delete-doctor.handler';
import { GetDoctorByIdHandler } from '../application/handlers/get-doctor-by-id.handler';
import { GetDoctorsHandler } from '../application/handlers/get-doctors.handler';
import { UpdateDoctorHandler } from '../application/handlers/update-doctor.handler';
import { GetDoctorByIdQuery } from '../application/queries/get-doctor-by-id.query';
import { GetDoctorsQuery } from '../application/queries/get-doctors.query';
import {
    validateCreateDoctorDto,
    validateDoctorId,
    validateUpdateDoctorDto,
} from '../dto/doctor.dto';
import { DoctorPrismaRepository } from '../infrastructure/doctor.prisma.repository';
import { DoctorService } from '../services/doctor.service';

export class DoctorController {
    private readonly commandBus = new CommandBus();
    private readonly queryBus = new QueryBus();
    private readonly repository = new DoctorPrismaRepository();
    private readonly service = new DoctorService(this.repository);

    async create(req: Request, res: Response) {
        const body = validateCreateDoctorDto(req.body);
        const handler = new CreateDoctorHandler(this.service);
        const command = new CreateDoctorCommand(body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(201).json(result);
    }

    async getAll(_req: Request, res: Response) {
        const handler = new GetDoctorsHandler(this.service);
        const query = new GetDoctorsQuery();
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getById(req: Request, res: Response) {
        const id = validateDoctorId(req.params.id);
        const handler = new GetDoctorByIdHandler(this.service);
        const query = new GetDoctorByIdQuery(id);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async update(req: Request, res: Response) {
        const id = validateDoctorId(req.params.id);
        const body = validateUpdateDoctorDto(req.body);
        const handler = new UpdateDoctorHandler(this.service);
        const command = new UpdateDoctorCommand(id, body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(200).json(result);
    }

    async delete(req: Request, res: Response) {
        const id = validateDoctorId(req.params.id);
        const handler = new DeleteDoctorHandler(this.service);
        const command = new DeleteDoctorCommand(id);

        await this.commandBus.execute(handler, command);

        return res.status(204).send();
    }
}
