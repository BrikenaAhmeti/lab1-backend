import {
    CommandHandler,
} from '../../../../shared/core/buses/command-bus';
import { NurseEntity } from '../../domain/nurse.entity';
import { NurseService } from '../../services/nurse.service';
import { CreateNurseCommand } from '../commands/create-nurse.command';

export class CreateNurseHandler
    implements CommandHandler<CreateNurseCommand, NurseEntity> {
    constructor(private readonly nurseService: NurseService) { }

    async execute(command: CreateNurseCommand): Promise<NurseEntity> {
        return this.nurseService.createNurse(command.data);
    }
}
