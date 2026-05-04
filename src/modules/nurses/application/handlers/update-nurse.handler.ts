import {
    CommandHandler,
} from '../../../../shared/core/buses/command-bus';
import { NurseEntity } from '../../domain/nurse.entity';
import { NurseService } from '../../services/nurse.service';
import { UpdateNurseCommand } from '../commands/update-nurse.command';

export class UpdateNurseHandler
    implements CommandHandler<UpdateNurseCommand, NurseEntity> {
    constructor(private readonly nurseService: NurseService) { }

    async execute(command: UpdateNurseCommand): Promise<NurseEntity> {
        return this.nurseService.updateNurse(command.id, command.data);
    }
}
