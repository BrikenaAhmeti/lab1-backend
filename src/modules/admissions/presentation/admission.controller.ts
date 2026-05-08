import { Request, Response } from 'express';
import { CommandBus } from '../../../shared/core/buses/command-bus';
import { QueryBus } from '../../../shared/core/buses/query-bus';
import { CreateAdmissionCommand } from '../application/commands/create-admission.command';
import { DischargeAdmissionCommand } from '../application/commands/discharge-admission.command';
import { CreateAdmissionHandler } from '../application/handlers/create-admission.handler';
import { DischargeAdmissionHandler } from '../application/handlers/discharge-admission.handler';
import { GetActiveAdmissionsHandler } from '../application/handlers/get-active-admissions.handler';
import { GetAdmissionsHandler } from '../application/handlers/get-admissions.handler';
import { GetActiveAdmissionsQuery } from '../application/queries/get-active-admissions.query';
import { GetAdmissionsQuery } from '../application/queries/get-admissions.query';
import {
    validateAdmissionId,
    validateCreateAdmissionDto,
    validateDischargeAdmissionDto,
    validateGetAdmissionsQueryDto,
} from '../dto/admission.dto';
import { AdmissionPrismaRepository } from '../infrastructure/admission.prisma.repository';
import { AdmissionService } from '../services/admission.service';

export class AdmissionController {
    private readonly commandBus = new CommandBus();
    private readonly queryBus = new QueryBus();
    private readonly repository = new AdmissionPrismaRepository();
    private readonly service = new AdmissionService(this.repository);

    async create(req: Request, res: Response) {
        const body = validateCreateAdmissionDto(req.body);
        const handler = new CreateAdmissionHandler(this.service);
        const command = new CreateAdmissionCommand(body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(201).json(result);
    }

    async getAll(req: Request, res: Response) {
        const queryData = validateGetAdmissionsQueryDto(req.query);
        const handler = new GetAdmissionsHandler(this.service);
        const query = new GetAdmissionsQuery(queryData);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getActive(req: Request, res: Response) {
        const queryData = validateGetAdmissionsQueryDto(req.query);
        const handler = new GetActiveAdmissionsHandler(this.service);
        const query = new GetActiveAdmissionsQuery(queryData);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async discharge(req: Request, res: Response) {
        const id = validateAdmissionId(req.params.id);
        const body = validateDischargeAdmissionDto(req.body ?? {});
        const handler = new DischargeAdmissionHandler(this.service);
        const command = new DischargeAdmissionCommand(id, body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(200).json(result);
    }
}
