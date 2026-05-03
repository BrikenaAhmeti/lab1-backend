import { CommandHandler } from '../../../../shared/core/buses/command-bus';
import { DepartmentService } from '../../services/department.service';
import { DeleteDepartmentCommand } from '../commands/delete-department.command';

export class DeleteDepartmentHandler
    implements CommandHandler<DeleteDepartmentCommand, void> {
    constructor(private readonly departmentService: DepartmentService) { }

    async execute(command: DeleteDepartmentCommand): Promise<void> {
        await this.departmentService.deleteDepartment(command.id);
    }
}
