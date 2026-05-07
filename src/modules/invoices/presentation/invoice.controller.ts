import { Request, Response } from 'express';
import { CommandBus } from '../../../shared/core/buses/command-bus';
import { QueryBus } from '../../../shared/core/buses/query-bus';
import { CreateInvoiceCommand } from '../application/commands/create-invoice.command';
import { DeleteInvoiceCommand } from '../application/commands/delete-invoice.command';
import { PayInvoiceCommand } from '../application/commands/pay-invoice.command';
import { UpdateInvoiceCommand } from '../application/commands/update-invoice.command';
import { CreateInvoiceHandler } from '../application/handlers/create-invoice.handler';
import { DeleteInvoiceHandler } from '../application/handlers/delete-invoice.handler';
import { GetInvoiceByIdHandler } from '../application/handlers/get-invoice-by-id.handler';
import { GetInvoiceStatsHandler } from '../application/handlers/get-invoice-stats.handler';
import { GetInvoicesHandler } from '../application/handlers/get-invoices.handler';
import { PayInvoiceHandler } from '../application/handlers/pay-invoice.handler';
import { UpdateInvoiceHandler } from '../application/handlers/update-invoice.handler';
import { GetInvoiceByIdQuery } from '../application/queries/get-invoice-by-id.query';
import { GetInvoiceStatsQuery } from '../application/queries/get-invoice-stats.query';
import { GetInvoicesQuery } from '../application/queries/get-invoices.query';
import {
    validateCreateInvoiceDto,
    validateGetInvoicesQueryDto,
    validateInvoiceId,
    validateUpdateInvoiceDto,
} from '../dto/invoice.dto';
import { InvoicePrismaRepository } from '../infrastructure/invoice.prisma.repository';
import { InvoiceService } from '../services/invoice.service';

export class InvoiceController {
    private readonly commandBus = new CommandBus();
    private readonly queryBus = new QueryBus();
    private readonly repository = new InvoicePrismaRepository();
    private readonly service = new InvoiceService(this.repository);

    async create(req: Request, res: Response) {
        const body = validateCreateInvoiceDto(req.body);
        const handler = new CreateInvoiceHandler(this.service);
        const command = new CreateInvoiceCommand(body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(201).json(result);
    }

    async getAll(req: Request, res: Response) {
        const queryData = validateGetInvoicesQueryDto(req.query);
        const handler = new GetInvoicesHandler(this.service);
        const query = new GetInvoicesQuery(queryData);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getStats(_req: Request, res: Response) {
        const handler = new GetInvoiceStatsHandler(this.service);
        const query = new GetInvoiceStatsQuery();
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getById(req: Request, res: Response) {
        const id = validateInvoiceId(req.params.id);
        const handler = new GetInvoiceByIdHandler(this.service);
        const query = new GetInvoiceByIdQuery(id);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async update(req: Request, res: Response) {
        const id = validateInvoiceId(req.params.id);
        const body = validateUpdateInvoiceDto(req.body);
        const handler = new UpdateInvoiceHandler(this.service);
        const command = new UpdateInvoiceCommand(id, body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(200).json(result);
    }

    async pay(req: Request, res: Response) {
        const id = validateInvoiceId(req.params.id);
        const handler = new PayInvoiceHandler(this.service);
        const command = new PayInvoiceCommand(id);
        const result = await this.commandBus.execute(handler, command);

        return res.status(200).json(result);
    }

    async delete(req: Request, res: Response) {
        const id = validateInvoiceId(req.params.id);
        const handler = new DeleteInvoiceHandler(this.service);
        const command = new DeleteInvoiceCommand(id);

        await this.commandBus.execute(handler, command);

        return res.status(204).send();
    }
}
