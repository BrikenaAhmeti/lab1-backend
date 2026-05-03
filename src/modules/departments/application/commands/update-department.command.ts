import { Command } from '../../../../shared/core/buses/command-bus';
import { UpdateDepartmentDto } from '../../dto/department.dto';

export class UpdateDepartmentCommand implements Command {
    constructor(
        public readonly id: string,
        public readonly data: UpdateDepartmentDto,
    ) { }
}
