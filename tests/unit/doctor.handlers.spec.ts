import { AppError } from '../../src/shared/core/errors/app-error';
import { CreateDoctorCommand } from '../../src/modules/doctors/application/commands/create-doctor.command';
import { DeleteDoctorCommand } from '../../src/modules/doctors/application/commands/delete-doctor.command';
import { UpdateDoctorCommand } from '../../src/modules/doctors/application/commands/update-doctor.command';
import { CreateDoctorHandler } from '../../src/modules/doctors/application/handlers/create-doctor.handler';
import { DeleteDoctorHandler } from '../../src/modules/doctors/application/handlers/delete-doctor.handler';
import { GetDoctorByIdHandler } from '../../src/modules/doctors/application/handlers/get-doctor-by-id.handler';
import { GetDoctorsHandler } from '../../src/modules/doctors/application/handlers/get-doctors.handler';
import { UpdateDoctorHandler } from '../../src/modules/doctors/application/handlers/update-doctor.handler';
import {
    DoctorDepartmentEntity,
    DoctorEntity,
    DoctorUserEntity,
} from '../../src/modules/doctors/domain/doctor.entity';
import { DoctorRepository } from '../../src/modules/doctors/domain/doctor.repository';
import { GetDoctorByIdQuery } from '../../src/modules/doctors/application/queries/get-doctor-by-id.query';
import { GetDoctorsQuery } from '../../src/modules/doctors/application/queries/get-doctors.query';
import {
    DoctorService,
    DoctorUserProvisioningService,
} from '../../src/modules/doctors/services/doctor.service';

function createDepartment(
    overrides: Partial<DoctorDepartmentEntity> = {},
): DoctorDepartmentEntity {
    return {
        id: overrides.id ?? 'department-1',
        name: overrides.name ?? 'Cardiology',
        location: overrides.location ?? 'Block A',
    };
}

function createUser(overrides: Partial<DoctorUserEntity> = {}): DoctorUserEntity {
    return {
        id: overrides.id ?? 'user-1',
    };
}

function createDoctor(overrides: Partial<DoctorEntity> = {}): DoctorEntity {
    return {
        id: overrides.id ?? 'doctor-1',
        userId: overrides.userId ?? 'user-1',
        firstName: overrides.firstName ?? 'Arben',
        lastName: overrides.lastName ?? 'Hoxha',
        specialization: overrides.specialization ?? 'Cardiology',
        departmentId: overrides.departmentId ?? 'department-1',
        phoneNumber: overrides.phoneNumber ?? '+38344111222',
        department: overrides.department ?? createDepartment(),
        createdAt: overrides.createdAt ?? new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-01-01T10:00:00.000Z'),
    };
}

describe('Doctor handlers', () => {
    const repository: jest.Mocked<DoctorRepository> = {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        findByUserId: jest.fn(),
        findUserById: jest.fn(),
        findDepartmentById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };
    const userProvisioningService: jest.Mocked<DoctorUserProvisioningService> = {
        provisionDoctorUser: jest.fn(),
        deleteUser: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a doctor when user and department exist', async () => {
        const department = createDepartment();
        const user = createUser();
        const doctor = createDoctor({
            userId: user.id,
            departmentId: department.id,
            department,
        });

        repository.findUserById.mockResolvedValue(user);
        repository.findDepartmentById.mockResolvedValue(department);
        repository.findByUserId.mockResolvedValue(null);
        repository.create.mockResolvedValue(doctor);

        const service = new DoctorService(repository, userProvisioningService);
        const handler = new CreateDoctorHandler(service);
        const command = new CreateDoctorCommand({
            userId: ' user-1 ',
            firstName: ' Arben ',
            lastName: ' Hoxha ',
            specialization: ' Cardiology ',
            departmentId: ' department-1 ',
            phoneNumber: '+38344111222',
        });

        const result = await handler.execute(command);

        expect(repository.findUserById).toHaveBeenCalledWith('user-1');
        expect(repository.findDepartmentById).toHaveBeenCalledWith('department-1');
        expect(repository.findByUserId).toHaveBeenCalledWith('user-1');
        expect(repository.create).toHaveBeenCalledWith({
            userId: 'user-1',
            firstName: 'Arben',
            lastName: 'Hoxha',
            specialization: 'Cardiology',
            departmentId: 'department-1',
            phoneNumber: '+38344111222',
        });
        expect(result.department.name).toBe('Cardiology');
    });

    it('should throw when a doctor already exists for the user', async () => {
        repository.findUserById.mockResolvedValue(createUser());
        repository.findDepartmentById.mockResolvedValue(createDepartment());
        repository.findByUserId.mockResolvedValue(createDoctor());

        const service = new DoctorService(repository, userProvisioningService);
        const handler = new CreateDoctorHandler(service);

        await expect(
            handler.execute(
                new CreateDoctorCommand({
                    userId: 'user-1',
                    firstName: 'Arben',
                    lastName: 'Hoxha',
                    specialization: 'Cardiology',
                    departmentId: 'department-1',
                    phoneNumber: '+38344111222',
                }),
            ),
        ).rejects.toBeInstanceOf(AppError);
        expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw when department does not exist', async () => {
        repository.findUserById.mockResolvedValue(createUser());
        repository.findDepartmentById.mockResolvedValue(null);

        const service = new DoctorService(repository, userProvisioningService);
        const handler = new CreateDoctorHandler(service);

        await expect(
            handler.execute(
                new CreateDoctorCommand({
                    userId: 'user-1',
                    firstName: 'Arben',
                    lastName: 'Hoxha',
                    specialization: 'Cardiology',
                    departmentId: 'missing-department',
                    phoneNumber: '+38344111222',
                }),
            ),
        ).rejects.toBeInstanceOf(AppError);
        expect(repository.create).not.toHaveBeenCalled();
    });

    it('should return paginated doctors filtered by department', async () => {
        const doctors = [
            createDoctor(),
            createDoctor({
                id: 'doctor-2',
                userId: 'user-2',
                firstName: 'Besa',
                lastName: 'Krasniqi',
                specialization: 'Neurology',
                departmentId: 'department-2',
            }),
        ];

        repository.findMany.mockResolvedValue(doctors);

        const service = new DoctorService(repository, userProvisioningService);
        const handler = new GetDoctorsHandler(service);
        const result = await handler.execute(new GetDoctorsQuery({
            page: 1,
            limit: 10,
            sortBy: 'last_name',
            order: 'ASC',
            departmentId: 'department-1',
            specialization: 'cardio',
        }));

        expect(repository.findMany).toHaveBeenCalled();
        expect(result).toEqual({
            data: [doctors[0]],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
        });
    });

    it('should return a doctor by id', async () => {
        const doctor = createDoctor();

        repository.findById.mockResolvedValue(doctor);

        const service = new DoctorService(repository, userProvisioningService);
        const handler = new GetDoctorByIdHandler(service);
        const result = await handler.execute(new GetDoctorByIdQuery('doctor-1'));

        expect(repository.findById).toHaveBeenCalledWith('doctor-1');
        expect(result.id).toBe('doctor-1');
    });

    it('should update a doctor', async () => {
        const existingDoctor = createDoctor();
        const nextDepartment = createDepartment({
            id: 'department-2',
            name: 'Neurology',
            location: 'Block B',
        });
        const updatedDoctor = createDoctor({
            specialization: 'Neurology',
            departmentId: nextDepartment.id,
            department: nextDepartment,
            updatedAt: new Date('2026-01-02T10:00:00.000Z'),
        });

        repository.findById.mockResolvedValue(existingDoctor);
        repository.findDepartmentById.mockResolvedValue(nextDepartment);
        repository.update.mockResolvedValue(updatedDoctor);

        const service = new DoctorService(repository, userProvisioningService);
        const handler = new UpdateDoctorHandler(service);
        const command = new UpdateDoctorCommand('doctor-1', {
            specialization: ' Neurology ',
            departmentId: ' department-2 ',
        });

        const result = await handler.execute(command);

        expect(repository.findById).toHaveBeenCalledWith('doctor-1');
        expect(repository.findDepartmentById).toHaveBeenCalledWith('department-2');
        expect(repository.update).toHaveBeenCalledWith('doctor-1', {
            specialization: 'Neurology',
            departmentId: 'department-2',
        });
        expect(result.department.name).toBe('Neurology');
    });

    it('should delete a doctor', async () => {
        const doctor = createDoctor();

        repository.findById.mockResolvedValue(doctor);
        repository.delete.mockResolvedValue(doctor);

        const service = new DoctorService(repository, userProvisioningService);
        const handler = new DeleteDoctorHandler(service);

        await handler.execute(new DeleteDoctorCommand('doctor-1'));

        expect(repository.findById).toHaveBeenCalledWith('doctor-1');
        expect(repository.delete).toHaveBeenCalledWith('doctor-1');
    });

    it('should auto-provision a user when userId is not provided', async () => {
        const department = createDepartment();
        const doctor = createDoctor({
            userId: 'generated-user-1',
            departmentId: department.id,
            department,
        });

        repository.findDepartmentById.mockResolvedValue(department);
        repository.create.mockResolvedValue(doctor);
        userProvisioningService.provisionDoctorUser.mockResolvedValue({
            id: 'generated-user-1',
            firstName: 'Leo',
            lastName: 'Doe',
            email: 'leo.doe@medsphere.local',
            username: 'leo.doe',
            phoneNumber: '+38349280810',
            emailConfirmed: false,
            isActive: true,
            lockoutEnabled: true,
            accessFailedCount: 0,
            roles: ['DOCTOR'],
            createdAt: new Date('2026-01-01T10:00:00.000Z'),
            updatedAt: new Date('2026-01-01T10:00:00.000Z'),
        });

        const service = new DoctorService(repository, userProvisioningService);
        const handler = new CreateDoctorHandler(service);

        const result = await handler.execute(
            new CreateDoctorCommand({
                firstName: ' Leo ',
                lastName: ' Doe ',
                specialization: ' Neurolog ',
                departmentId: ` ${department.id} `,
                phoneNumber: ' +38349280810 ',
            }),
        );

        expect(userProvisioningService.provisionDoctorUser).toHaveBeenCalledWith({
            firstName: 'Leo',
            lastName: 'Doe',
            phoneNumber: '+38349280810',
        });
        expect(repository.create).toHaveBeenCalledWith({
            userId: 'generated-user-1',
            firstName: 'Leo',
            lastName: 'Doe',
            specialization: 'Neurolog',
            departmentId: department.id,
            phoneNumber: '+38349280810',
        });
        expect(result.userId).toBe('generated-user-1');
    });
});
