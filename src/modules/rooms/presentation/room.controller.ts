import { Request, Response } from 'express';
import { CommandBus } from '../../../shared/core/buses/command-bus';
import { QueryBus } from '../../../shared/core/buses/query-bus';
import { CreateRoomCommand } from '../application/commands/create-room.command';
import { DeleteRoomCommand } from '../application/commands/delete-room.command';
import { UpdateRoomCommand } from '../application/commands/update-room.command';
import { CreateRoomHandler } from '../application/handlers/create-room.handler';
import { DeleteRoomHandler } from '../application/handlers/delete-room.handler';
import { GetAvailableRoomsHandler } from '../application/handlers/get-available-rooms.handler';
import { GetRoomByIdHandler } from '../application/handlers/get-room-by-id.handler';
import { GetRoomsHandler } from '../application/handlers/get-rooms.handler';
import { UpdateRoomHandler } from '../application/handlers/update-room.handler';
import { GetAvailableRoomsQuery } from '../application/queries/get-available-rooms.query';
import { GetRoomByIdQuery } from '../application/queries/get-room-by-id.query';
import { GetRoomsQuery } from '../application/queries/get-rooms.query';
import {
    validateCreateRoomDto,
    validateGetRoomsQueryDto,
    validateRoomId,
    validateUpdateRoomDto,
} from '../dto/room.dto';
import { RoomPrismaRepository } from '../infrastructure/room.prisma.repository';
import { RoomService } from '../services/room.service';

export class RoomController {
    private readonly commandBus = new CommandBus();
    private readonly queryBus = new QueryBus();
    private readonly repository = new RoomPrismaRepository();
    private readonly service = new RoomService(this.repository);

    async create(req: Request, res: Response) {
        const body = validateCreateRoomDto(req.body);
        const handler = new CreateRoomHandler(this.service);
        const command = new CreateRoomCommand(body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(201).json(result);
    }

    async getAll(req: Request, res: Response) {
        const queryParams = validateGetRoomsQueryDto(req.query);
        const handler = new GetRoomsHandler(this.service);
        const query = new GetRoomsQuery(queryParams);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getAvailable(req: Request, res: Response) {
        const queryParams = validateGetRoomsQueryDto(req.query);
        const handler = new GetAvailableRoomsHandler(this.service);
        const query = new GetAvailableRoomsQuery(queryParams);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async getById(req: Request, res: Response) {
        const id = validateRoomId(req.params.id);
        const handler = new GetRoomByIdHandler(this.service);
        const query = new GetRoomByIdQuery(id);
        const result = await this.queryBus.execute(handler, query);

        return res.status(200).json(result);
    }

    async update(req: Request, res: Response) {
        const id = validateRoomId(req.params.id);
        const body = validateUpdateRoomDto(req.body);
        const handler = new UpdateRoomHandler(this.service);
        const command = new UpdateRoomCommand(id, body);
        const result = await this.commandBus.execute(handler, command);

        return res.status(200).json(result);
    }

    async delete(req: Request, res: Response) {
        const id = validateRoomId(req.params.id);
        const handler = new DeleteRoomHandler(this.service);
        const command = new DeleteRoomCommand(id);

        await this.commandBus.execute(handler, command);

        return res.status(204).send();
    }
}
