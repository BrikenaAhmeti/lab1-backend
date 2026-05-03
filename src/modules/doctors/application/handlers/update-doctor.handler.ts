import {
    CommandHandler,
} from '../../../../shared/core/buses/command-bus';
import { DoctorEntity } from '../../domain/doctor.entity';
import { DoctorService } from '../../services/doctor.service';
import { UpdateDoctorCommand } from '../commands/update-doctor.command';

export class UpdateDoctorHandler
    implements CommandHandler<UpdateDoctorCommand, DoctorEntity> {
    constructor(private readonly doctorService: DoctorService) { }

    async execute(command: UpdateDoctorCommand): Promise<DoctorEntity> {
        return this.doctorService.updateDoctor(command.id, command.data);
    }
}
