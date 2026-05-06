import { Request, Response } from 'express';
import { CommandBus } from '../../../shared/core/buses/command-bus';
import { QueryBus } from '../../../shared/core/buses/query-bus';
import { CreateMedicalRecordCommand } from '../application/commands/create-medical-record.command';
import { DeleteMedicalRecordCommand } from '../application/commands/delete-medical-record.command';
import { UpdateMedicalRecordCommand } from '../application/commands/update-medical-record.command';
import { CreateMedicalRecordHandler } from '../application/handlers/create-medical-record.handler';
import { DeleteMedicalRecordHandler } from '../application/handlers/delete-medical-record.handler';
import { GetMedicalRecordByIdHandler } from '../application/handlers/get-medical-record-by-id.handler';
import { GetMedicalRecordPrescriptionsHandler } from '../application/handlers/get-medical-record-prescriptions.handler';
import { GetMedicalRecordsHandler } from '../application/handlers/get-medical-records.handler';
import { UpdateMedicalRecordHandler } from '../application/handlers/update-medical-record.handler';
import { GetMedicalRecordByIdQuery } from '../application/queries/get-medical-record-by-id.query';
import { GetMedicalRecordPrescriptionsQuery } from '../application/queries/get-medical-record-prescriptions.query';
import { GetMedicalRecordsQuery } from '../application/queries/get-medical-records.query';
import {
    validateCreateMedicalRecordDto,
    validateGetMedicalRecordsQueryDto,
    validateMedicalRecordId,
    validateUpdateMedicalRecordDto,
} from '../dto/medical-record.dto';
import { MedicalRecordPrismaRepository } from '../infrastructure/medical-record.prisma.repository';
import { MedicalRecordService } from '../services/medical-record.service';

export class MedicalRecordController {
    private readonly commandBus = new CommandBus();
    private readonly queryBus = new QueryBus();
    private readonly repository = new MedicalRecordPrismaRepository();
    private readonly service = new MedicalRecordService(this.repository);

    async create(req: Request, res: Response) {
        const body = validateCreateMedicalRecordDto(req.body);
        const handler = new CreateMedicalRecordHandler(this.service);
        const command = new CreateMedicalRecordCommand(body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(201).json(result);
    }

    async getAll(req: Request, res: Response) {
        const queryData = validateGetMedicalRecordsQueryDto(req.query);
        const handler = new GetMedicalRecordsHandler(this.service);
        const query = new GetMedicalRecordsQuery(queryData.patientId);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getById(req: Request, res: Response) {
        const id = validateMedicalRecordId(req.params.id);
        const handler = new GetMedicalRecordByIdHandler(this.service);
        const query = new GetMedicalRecordByIdQuery(id);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getPrescriptions(req: Request, res: Response) {
        const id = validateMedicalRecordId(req.params.id);
        const handler = new GetMedicalRecordPrescriptionsHandler(this.service);
        const query = new GetMedicalRecordPrescriptionsQuery(id);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async update(req: Request, res: Response) {
        const id = validateMedicalRecordId(req.params.id);
        const body = validateUpdateMedicalRecordDto(req.body);
        const handler = new UpdateMedicalRecordHandler(this.service);
        const command = new UpdateMedicalRecordCommand(id, body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(200).json(result);
    }

    async delete(req: Request, res: Response) {
        const id = validateMedicalRecordId(req.params.id);
        const handler = new DeleteMedicalRecordHandler(this.service);
        const command = new DeleteMedicalRecordCommand(id);

        await this.commandBus.execute(handler, command);

        return res.status(204).send();
    }
}
