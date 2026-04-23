import { Request, Response } from 'express';
import { CommandBus } from '../../shared/core/buses/command-bus';
import { QueryBus } from '../../shared/core/buses/query-bus';
import { PatientPrismaRepository } from './infrastructure/patient.prisma.repository';
import { PatientService } from './services/patient.service';
import {
    validateCreatePatientDto,
    validateGetPatientsQueryDto,
    validatePatientId,
    validateUpdatePatientDto,
} from './dto/patient.dto';
import { CreatePatientHandler } from './commands/create-patient.handler';
import { CreatePatientCommand } from './commands/create-patient.command';
import { GetPatientsHandler } from './queries/get-patients.handler';
import { GetPatientsQuery } from './queries/get-patients.query';
import { GetPatientHandler } from './queries/get-patient.handler';
import { GetPatientQuery } from './queries/get-patient.query';
import { UpdatePatientHandler } from './commands/update-patient.handler';
import { UpdatePatientCommand } from './commands/update-patient.command';
import { DeletePatientHandler } from './commands/delete-patient.handler';
import { DeletePatientCommand } from './commands/delete-patient.command';

export class PatientsController {
    private readonly commandBus = new CommandBus();
    private readonly queryBus = new QueryBus();
    private readonly repository = new PatientPrismaRepository();
    private readonly service = new PatientService(this.repository);

    async create(req: Request, res: Response) {
        const body = validateCreatePatientDto(req.body);
        const handler = new CreatePatientHandler(this.service);
        const command = new CreatePatientCommand(body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(201).json(result);
    }

    async getAll(req: Request, res: Response) {
        const queryData = validateGetPatientsQueryDto(req.query);
        const handler = new GetPatientsHandler(this.service);
        const query = new GetPatientsQuery(
            queryData.page,
            queryData.limit,
            queryData.search,
        );
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getById(req: Request, res: Response) {
        const id = validatePatientId(req.params.id);
        const handler = new GetPatientHandler(this.service);
        const query = new GetPatientQuery(id);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async update(req: Request, res: Response) {
        const id = validatePatientId(req.params.id);
        const body = validateUpdatePatientDto(req.body);
        const handler = new UpdatePatientHandler(this.service);
        const command = new UpdatePatientCommand(id, body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(200).json(result);
    }

    async delete(req: Request, res: Response) {
        const id = validatePatientId(req.params.id);
        const handler = new DeletePatientHandler(this.service);
        const command = new DeletePatientCommand(id);

        await this.commandBus.execute(handler, command);

        return res.status(204).send();
    }
}
