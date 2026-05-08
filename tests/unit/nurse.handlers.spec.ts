import { AppError } from '../../src/shared/core/errors/app-error';
import { CreateNurseCommand } from '../../src/modules/nurses/application/commands/create-nurse.command';
import { DeleteNurseCommand } from '../../src/modules/nurses/application/commands/delete-nurse.command';
import { UpdateNurseCommand } from '../../src/modules/nurses/application/commands/update-nurse.command';
import { CreateNurseHandler } from '../../src/modules/nurses/application/handlers/create-nurse.handler';
import { DeleteNurseHandler } from '../../src/modules/nurses/application/handlers/delete-nurse.handler';
import { GetNurseByIdHandler } from '../../src/modules/nurses/application/handlers/get-nurse-by-id.handler';
import { GetNursesHandler } from '../../src/modules/nurses/application/handlers/get-nurses.handler';
import { UpdateNurseHandler } from '../../src/modules/nurses/application/handlers/update-nurse.handler';
import {
    NurseDepartmentEntity,
    NurseEntity,
} from '../../src/modules/nurses/domain/nurse.entity';
import { NurseRepository } from '../../src/modules/nurses/domain/nurse.repository';
import { GetNurseByIdQuery } from '../../src/modules/nurses/application/queries/get-nurse-by-id.query';
import { GetNursesQuery } from '../../src/modules/nurses/application/queries/get-nurses.query';
import { NurseService } from '../../src/modules/nurses/services/nurse.service';

function createDepartment(
    overrides: Partial<NurseDepartmentEntity> = {},
): NurseDepartmentEntity {
    return {
        id: overrides.id ?? 'department-1',
        name: overrides.name ?? 'Cardiology',
        location: overrides.location ?? 'Block A',
    };
}

function createNurse(overrides: Partial<NurseEntity> = {}): NurseEntity {
    return {
        id: overrides.id ?? 'nurse-1',
        firstName: overrides.firstName ?? 'Sara',
        lastName: overrides.lastName ?? 'Krasniqi',
        departmentId: overrides.departmentId ?? 'department-1',
        shift: overrides.shift ?? 'Morning',
        department: overrides.department ?? createDepartment(),
        createdAt: overrides.createdAt ?? new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-01-01T10:00:00.000Z'),
    };
}

describe('Nurse handlers', () => {
    const repository: jest.Mocked<NurseRepository> = {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        findDepartmentById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a nurse when department exists', async () => {
        const department = createDepartment();
        const nurse = createNurse({
            departmentId: department.id,
            department,
        });

        repository.findDepartmentById.mockResolvedValue(department);
        repository.create.mockResolvedValue(nurse);

        const service = new NurseService(repository);
        const handler = new CreateNurseHandler(service);
        const command = new CreateNurseCommand({
            firstName: ' Sara ',
            lastName: ' Krasniqi ',
            departmentId: ' department-1 ',
            shift: 'Morning',
        });

        const result = await handler.execute(command);

        expect(repository.findDepartmentById).toHaveBeenCalledWith('department-1');
        expect(repository.create).toHaveBeenCalledWith({
            firstName: 'Sara',
            lastName: 'Krasniqi',
            departmentId: 'department-1',
            shift: 'Morning',
        });
        expect(result.department.name).toBe('Cardiology');
    });

    it('should throw when department does not exist', async () => {
        repository.findDepartmentById.mockResolvedValue(null);

        const service = new NurseService(repository);
        const handler = new CreateNurseHandler(service);

        await expect(
            handler.execute(
                new CreateNurseCommand({
                    firstName: 'Sara',
                    lastName: 'Krasniqi',
                    departmentId: 'missing-department',
                    shift: 'Morning',
                }),
            ),
        ).rejects.toBeInstanceOf(AppError);
        expect(repository.create).not.toHaveBeenCalled();
    });

    it('should return nurses filtered by department', async () => {
        const department = createDepartment();
        const nurses = [createNurse()];

        repository.findDepartmentById.mockResolvedValue(department);
        repository.findMany.mockResolvedValue(nurses);

        const service = new NurseService(repository);
        const handler = new GetNursesHandler(service);
        const result = await handler.execute(new GetNursesQuery({
            page: 1,
            limit: 10,
            sortBy: 'created_at',
            order: 'DESC',
            departmentId: 'department-1',
        }));

        expect(repository.findDepartmentById).toHaveBeenCalledWith('department-1');
        expect(repository.findMany).toHaveBeenCalledWith('department-1');
        expect(result).toEqual({
            data: nurses,
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
        });
    });

    it('should return a nurse by id', async () => {
        const nurse = createNurse();

        repository.findById.mockResolvedValue(nurse);

        const service = new NurseService(repository);
        const handler = new GetNurseByIdHandler(service);
        const result = await handler.execute(new GetNurseByIdQuery('nurse-1'));

        expect(repository.findById).toHaveBeenCalledWith('nurse-1');
        expect(result.id).toBe('nurse-1');
    });

    it('should update a nurse', async () => {
        const existingNurse = createNurse();
        const nextDepartment = createDepartment({
            id: 'department-2',
            name: 'Neurology',
            location: 'Block B',
        });
        const updatedNurse = createNurse({
            departmentId: nextDepartment.id,
            shift: 'Night',
            department: nextDepartment,
            updatedAt: new Date('2026-01-02T10:00:00.000Z'),
        });

        repository.findById.mockResolvedValue(existingNurse);
        repository.findDepartmentById.mockResolvedValue(nextDepartment);
        repository.update.mockResolvedValue(updatedNurse);

        const service = new NurseService(repository);
        const handler = new UpdateNurseHandler(service);
        const command = new UpdateNurseCommand('nurse-1', {
            departmentId: ' department-2 ',
            shift: 'Night',
        });

        const result = await handler.execute(command);

        expect(repository.findById).toHaveBeenCalledWith('nurse-1');
        expect(repository.findDepartmentById).toHaveBeenCalledWith('department-2');
        expect(repository.update).toHaveBeenCalledWith('nurse-1', {
            departmentId: 'department-2',
            shift: 'Night',
        });
        expect(result.department.name).toBe('Neurology');
    });

    it('should delete a nurse', async () => {
        const nurse = createNurse();

        repository.findById.mockResolvedValue(nurse);
        repository.delete.mockResolvedValue(nurse);

        const service = new NurseService(repository);
        const handler = new DeleteNurseHandler(service);

        await handler.execute(new DeleteNurseCommand('nurse-1'));

        expect(repository.findById).toHaveBeenCalledWith('nurse-1');
        expect(repository.delete).toHaveBeenCalledWith('nurse-1');
    });
});
