import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { DoctorEntity } from '../../domain/doctor.entity';
import { SetDoctorStatusCommand } from '../commands/set-doctor-status.command';
import { DoctorService } from '../../services/doctor.service';

export class SetDoctorStatusHandler
    implements CommandHandler<SetDoctorStatusCommand, DoctorEntity> {
    constructor(private readonly doctorService: DoctorService) { }

    async execute(command: SetDoctorStatusCommand): Promise<DoctorEntity> {
        return this.doctorService.setDoctorStatus(command.id, command.isActive);
    }
}
