import { Request, Response } from 'express';
import { CommandBus } from '../../../shared/core/buses/command-bus';
import { QueryBus } from '../../../shared/core/buses/query-bus';
import { CreatePrescriptionCommand } from '../application/commands/create-prescription.command';
import { DeletePrescriptionCommand } from '../application/commands/delete-prescription.command';
import { UpdatePrescriptionCommand } from '../application/commands/update-prescription.command';
import { CreatePrescriptionHandler } from '../application/handlers/create-prescription.handler';
import { DeletePrescriptionHandler } from '../application/handlers/delete-prescription.handler';
import { GetPrescriptionByIdHandler } from '../application/handlers/get-prescription-by-id.handler';
import { GetPrescriptionsHandler } from '../application/handlers/get-prescriptions.handler';
import { UpdatePrescriptionHandler } from '../application/handlers/update-prescription.handler';
import { GetPrescriptionByIdQuery } from '../application/queries/get-prescription-by-id.query';
import { GetPrescriptionsQuery } from '../application/queries/get-prescriptions.query';
import {
    validateCreatePrescriptionDto,
    validateGetPrescriptionsQueryDto,
    validatePrescriptionId,
    validateUpdatePrescriptionDto,
} from '../dto/prescription.dto';
import { PrescriptionPrismaRepository } from '../infrastructure/prescription.prisma.repository';
import { PrescriptionService } from '../services/prescription.service';

export class PrescriptionController {
    private readonly commandBus = new CommandBus();
    private readonly queryBus = new QueryBus();
    private readonly repository = new PrescriptionPrismaRepository();
    private readonly service = new PrescriptionService(this.repository);

    async create(req: Request, res: Response) {
        const body = validateCreatePrescriptionDto(req.body);
        const handler = new CreatePrescriptionHandler(this.service);
        const command = new CreatePrescriptionCommand(body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(201).json(result);
    }

    async getAll(req: Request, res: Response) {
        const queryData = validateGetPrescriptionsQueryDto(req.query);
        const handler = new GetPrescriptionsHandler(this.service);
        const query = new GetPrescriptionsQuery(queryData);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getById(req: Request, res: Response) {
        const id = validatePrescriptionId(req.params.id);
        const handler = new GetPrescriptionByIdHandler(this.service);
        const query = new GetPrescriptionByIdQuery(id);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async update(req: Request, res: Response) {
        const id = validatePrescriptionId(req.params.id);
        const body = validateUpdatePrescriptionDto(req.body);
        const handler = new UpdatePrescriptionHandler(this.service);
        const command = new UpdatePrescriptionCommand(id, body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(200).json(result);
    }

    async delete(req: Request, res: Response) {
        const id = validatePrescriptionId(req.params.id);
        const handler = new DeletePrescriptionHandler(this.service);
        const command = new DeletePrescriptionCommand(id);

        await this.commandBus.execute(handler, command);

        return res.status(204).send();
    }
}
