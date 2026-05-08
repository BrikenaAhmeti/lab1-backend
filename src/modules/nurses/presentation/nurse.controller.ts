import { Request, Response } from 'express';
import { CommandBus } from '../../../shared/core/buses/command-bus';
import { QueryBus } from '../../../shared/core/buses/query-bus';
import { CreateNurseCommand } from '../application/commands/create-nurse.command';
import { DeleteNurseCommand } from '../application/commands/delete-nurse.command';
import { UpdateNurseCommand } from '../application/commands/update-nurse.command';
import { CreateNurseHandler } from '../application/handlers/create-nurse.handler';
import { DeleteNurseHandler } from '../application/handlers/delete-nurse.handler';
import { GetNurseByIdHandler } from '../application/handlers/get-nurse-by-id.handler';
import { GetNursesHandler } from '../application/handlers/get-nurses.handler';
import { UpdateNurseHandler } from '../application/handlers/update-nurse.handler';
import { GetNurseByIdQuery } from '../application/queries/get-nurse-by-id.query';
import { GetNursesQuery } from '../application/queries/get-nurses.query';
import {
    validateCreateNurseDto,
    validateGetNursesQueryDto,
    validateNurseId,
    validateUpdateNurseDto,
} from '../dto/nurse.dto';
import { NursePrismaRepository } from '../infrastructure/nurse.prisma.repository';
import { NurseService } from '../services/nurse.service';

export class NurseController {
    private readonly commandBus = new CommandBus();
    private readonly queryBus = new QueryBus();
    private readonly repository = new NursePrismaRepository();
    private readonly service = new NurseService(this.repository);

    async create(req: Request, res: Response) {
        const body = validateCreateNurseDto(req.body);
        const handler = new CreateNurseHandler(this.service);
        const command = new CreateNurseCommand(body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(201).json(result);
    }

    async getAll(req: Request, res: Response) {
        const queryData = validateGetNursesQueryDto(req.query);
        const handler = new GetNursesHandler(this.service);
        const query = new GetNursesQuery(queryData);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getById(req: Request, res: Response) {
        const id = validateNurseId(req.params.id);
        const handler = new GetNurseByIdHandler(this.service);
        const query = new GetNurseByIdQuery(id);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async update(req: Request, res: Response) {
        const id = validateNurseId(req.params.id);
        const body = validateUpdateNurseDto(req.body);
        const handler = new UpdateNurseHandler(this.service);
        const command = new UpdateNurseCommand(id, body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(200).json(result);
    }

    async delete(req: Request, res: Response) {
        const id = validateNurseId(req.params.id);
        const handler = new DeleteNurseHandler(this.service);
        const command = new DeleteNurseCommand(id);

        await this.commandBus.execute(handler, command);

        return res.status(204).send();
    }
}
