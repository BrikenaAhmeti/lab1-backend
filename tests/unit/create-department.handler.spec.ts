import { CreateDepartmentCommand } from '../../src/modules/departments/application/commands/create-department.command';
import { DeleteDepartmentCommand } from '../../src/modules/departments/application/commands/delete-department.command';
import { UpdateDepartmentCommand } from '../../src/modules/departments/application/commands/update-department.command';
import { CreateDepartmentHandler } from '../../src/modules/departments/application/handlers/create-department.handler';
import { DeleteDepartmentHandler } from '../../src/modules/departments/application/handlers/delete-department.handler';
import { GetDepartmentByIdHandler } from '../../src/modules/departments/application/handlers/get-department-by-id.handler';
import { GetDepartmentDoctorsHandler } from '../../src/modules/departments/application/handlers/get-department-doctors.handler';
import { GetDepartmentRoomsHandler } from '../../src/modules/departments/application/handlers/get-department-rooms.handler';
import { GetDepartmentsHandler } from '../../src/modules/departments/application/handlers/get-departments.handler';
import { UpdateDepartmentHandler } from '../../src/modules/departments/application/handlers/update-department.handler';
import {
    DepartmentDoctorEntity,
    DepartmentEntity,
    DepartmentRoomEntity,
} from '../../src/modules/departments/domain/department.entity';
import { DepartmentRepository } from '../../src/modules/departments/domain/department.repository';
import { GetDepartmentByIdQuery } from '../../src/modules/departments/application/queries/get-department-by-id.query';
import { GetDepartmentDoctorsQuery } from '../../src/modules/departments/application/queries/get-department-doctors.query';
import { GetDepartmentRoomsQuery } from '../../src/modules/departments/application/queries/get-department-rooms.query';
import { GetDepartmentsQuery } from '../../src/modules/departments/application/queries/get-departments.query';
import { DepartmentService } from '../../src/modules/departments/services/department.service';
import { AppError } from '../../src/shared/core/errors/app-error';

function createDepartment(
    overrides: Partial<DepartmentEntity> = {},
): DepartmentEntity {
    return {
        id: overrides.id ?? 'department-1',
        name: overrides.name ?? 'Cardiology',
        description: overrides.description ?? 'Heart department',
        location: overrides.location ?? 'Block A',
        isActive: overrides.isActive ?? true,
        createdAt: overrides.createdAt ?? new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-01-01T10:00:00.000Z'),
    };
}

function createDoctor(
    overrides: Partial<DepartmentDoctorEntity> = {},
): DepartmentDoctorEntity {
    return {
        id: overrides.id ?? 'doctor-1',
        userId: overrides.userId ?? 'user-1',
        firstName: overrides.firstName ?? 'Arben',
        lastName: overrides.lastName ?? 'Hoxha',
        specialization: overrides.specialization ?? 'Cardiology',
        departmentId: overrides.departmentId ?? 'department-1',
        phoneNumber: overrides.phoneNumber ?? '+38344111222',
        createdAt: overrides.createdAt ?? new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-01-01T10:00:00.000Z'),
    };
}

function createRoom(
    overrides: Partial<DepartmentRoomEntity> = {},
): DepartmentRoomEntity {
    return {
        id: overrides.id ?? 'room-1',
        roomNumber: overrides.roomNumber ?? '101',
        departmentId: overrides.departmentId ?? 'department-1',
        type: overrides.type ?? 'STANDARD',
        status: overrides.status ?? 'AVAILABLE',
        capacity: overrides.capacity ?? 2,
        createdAt: overrides.createdAt ?? new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-01-01T10:00:00.000Z'),
    };
}

describe('Department handlers', () => {
    const repository: jest.Mocked<DepartmentRepository> = {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        findByName: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findDoctorsByDepartmentId: jest.fn(),
        findRoomsByDepartmentId: jest.fn(),
        countUsage: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a department when name is unique', async () => {
        repository.findByName.mockResolvedValue(null);
        repository.create.mockResolvedValue(createDepartment());

        const service = new DepartmentService(repository);
        const handler = new CreateDepartmentHandler(service);
        const command = new CreateDepartmentCommand(
            ' Cardiology ',
            ' Block A ',
            ' Heart department ',
        );

        const result = await handler.execute(command);

        expect(repository.findByName).toHaveBeenCalledWith('Cardiology');
        expect(repository.create).toHaveBeenCalledWith({
            name: 'Cardiology',
            description: 'Heart department',
            location: 'Block A',
        });
        expect(result.name).toBe('Cardiology');
    });

    it('should throw when department already exists', async () => {
        repository.findByName.mockResolvedValue(createDepartment());

        const service = new DepartmentService(repository);
        const handler = new CreateDepartmentHandler(service);
        const command = new CreateDepartmentCommand('Cardiology', 'Block A');

        await expect(handler.execute(command)).rejects.toBeInstanceOf(AppError);
        expect(repository.create).not.toHaveBeenCalled();
    });

    it('should return all departments', async () => {
        const departments = [
            createDepartment(),
            createDepartment({
                id: 'department-2',
                name: 'Neurology',
                location: 'Block B',
            }),
        ];

        repository.findMany.mockResolvedValue(departments);

        const service = new DepartmentService(repository);
        const handler = new GetDepartmentsHandler(service);
        const result = await handler.execute(new GetDepartmentsQuery());

        expect(repository.findMany).toHaveBeenCalled();
        expect(result).toEqual(departments);
    });

    it('should return a department by id', async () => {
        const department = createDepartment();

        repository.findById.mockResolvedValue(department);

        const service = new DepartmentService(repository);
        const handler = new GetDepartmentByIdHandler(service);
        const result = await handler.execute(
            new GetDepartmentByIdQuery('department-1'),
        );

        expect(repository.findById).toHaveBeenCalledWith('department-1');
        expect(result.id).toBe('department-1');
    });

    it('should update a department', async () => {
        const department = createDepartment();
        const updatedDepartment = createDepartment({
            name: 'Neurology',
            location: 'Block C',
            description: 'Brain department',
        });

        repository.findById.mockResolvedValue(department);
        repository.findByName.mockResolvedValue(null);
        repository.update.mockResolvedValue(updatedDepartment);

        const service = new DepartmentService(repository);
        const handler = new UpdateDepartmentHandler(service);
        const command = new UpdateDepartmentCommand('department-1', {
            name: ' Neurology ',
            location: ' Block C ',
            description: ' Brain department ',
        });

        const result = await handler.execute(command);

        expect(repository.findById).toHaveBeenCalledWith('department-1');
        expect(repository.findByName).toHaveBeenCalledWith('Neurology');
        expect(repository.update).toHaveBeenCalledWith('department-1', {
            name: 'Neurology',
            location: 'Block C',
            description: 'Brain department',
        });
        expect(result.name).toBe('Neurology');
    });

    it('should delete a department when it has no related records', async () => {
        repository.findById.mockResolvedValue(createDepartment());
        repository.countUsage.mockResolvedValue({
            doctors: 0,
            rooms: 0,
            nurses: 0,
        });
        repository.delete.mockResolvedValue(createDepartment());

        const service = new DepartmentService(repository);
        const handler = new DeleteDepartmentHandler(service);

        await handler.execute(new DeleteDepartmentCommand('department-1'));

        expect(repository.countUsage).toHaveBeenCalledWith('department-1');
        expect(repository.delete).toHaveBeenCalledWith('department-1');
    });

    it('should throw when deleting a department that is in use', async () => {
        repository.findById.mockResolvedValue(createDepartment());
        repository.countUsage.mockResolvedValue({
            doctors: 1,
            rooms: 0,
            nurses: 0,
        });

        const service = new DepartmentService(repository);
        const handler = new DeleteDepartmentHandler(service);

        await expect(
            handler.execute(new DeleteDepartmentCommand('department-1')),
        ).rejects.toBeInstanceOf(AppError);
        expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should return doctors for a department', async () => {
        const department = createDepartment();
        const doctors = [createDoctor()];

        repository.findById.mockResolvedValue(department);
        repository.findDoctorsByDepartmentId.mockResolvedValue(doctors);

        const service = new DepartmentService(repository);
        const handler = new GetDepartmentDoctorsHandler(service);
        const result = await handler.execute(
            new GetDepartmentDoctorsQuery('department-1'),
        );

        expect(repository.findDoctorsByDepartmentId).toHaveBeenCalledWith(
            'department-1',
        );
        expect(result).toEqual(doctors);
    });

    it('should return rooms for a department', async () => {
        const department = createDepartment();
        const rooms = [createRoom()];

        repository.findById.mockResolvedValue(department);
        repository.findRoomsByDepartmentId.mockResolvedValue(rooms);

        const service = new DepartmentService(repository);
        const handler = new GetDepartmentRoomsHandler(service);
        const result = await handler.execute(
            new GetDepartmentRoomsQuery('department-1'),
        );

        expect(repository.findRoomsByDepartmentId).toHaveBeenCalledWith(
            'department-1',
        );
        expect(result).toEqual(rooms);
    });
});
