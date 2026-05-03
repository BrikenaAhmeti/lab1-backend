import {
    CommandHandler,
} from '../../../../shared/core/buses/command-bus';
import { DoctorEntity } from '../../domain/doctor.entity';
import { DoctorService } from '../../services/doctor.service';
import { CreateDoctorCommand } from '../commands/create-doctor.command';

export class CreateDoctorHandler
    implements CommandHandler<CreateDoctorCommand, DoctorEntity> {
    constructor(private readonly doctorService: DoctorService) { }

    async execute(command: CreateDoctorCommand): Promise<DoctorEntity> {
        return this.doctorService.createDoctor(command.data);
    }
}
