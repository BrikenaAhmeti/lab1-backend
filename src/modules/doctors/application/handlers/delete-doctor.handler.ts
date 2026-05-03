import {
    CommandHandler,
} from '../../../../shared/core/buses/command-bus';
import { DoctorService } from '../../services/doctor.service';
import { DeleteDoctorCommand } from '../commands/delete-doctor.command';

export class DeleteDoctorHandler
    implements CommandHandler<DeleteDoctorCommand, void> {
    constructor(private readonly doctorService: DoctorService) { }

    async execute(command: DeleteDoctorCommand): Promise<void> {
        await this.doctorService.deleteDoctor(command.id);
    }
}
