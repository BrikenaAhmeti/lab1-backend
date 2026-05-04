import {
    CommandHandler,
} from '../../../../shared/core/buses/command-bus';
import { NurseService } from '../../services/nurse.service';
import { DeleteNurseCommand } from '../commands/delete-nurse.command';

export class DeleteNurseHandler
    implements CommandHandler<DeleteNurseCommand, void> {
    constructor(private readonly nurseService: NurseService) { }

    async execute(command: DeleteNurseCommand): Promise<void> {
        await this.nurseService.deleteNurse(command.id);
    }
}
