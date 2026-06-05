import { AppError } from '../../src/shared/core/errors/app-error';
import { CreatePatientCommand } from '../../src/modules/patients/commands/create-patient.command';
import { CreatePatientHandler } from '../../src/modules/patients/commands/create-patient.handler';
import { DeletePatientCommand } from '../../src/modules/patients/commands/delete-patient.command';
import { DeletePatientHandler } from '../../src/modules/patients/commands/delete-patient.handler';
import { UpdatePatientCommand } from '../../src/modules/patients/commands/update-patient.command';
import { UpdatePatientHandler } from '../../src/modules/patients/commands/update-patient.handler';
import { PatientEntity } from '../../src/modules/patients/domain/patient.entity';
import { PatientRepository } from '../../src/modules/patients/domain/patient.repository';
import { GetPatientHandler } from '../../src/modules/patients/queries/get-patient.handler';
import { GetPatientQuery } from '../../src/modules/patients/queries/get-patient.query';
import { GetPatientsHandler } from '../../src/modules/patients/queries/get-patients.handler';
import { GetPatientsQuery } from '../../src/modules/patients/queries/get-patients.query';
import { PatientService } from '../../src/modules/patients/services/patient.service';

function createPatient(overrides: Partial<PatientEntity> = {}): PatientEntity {
    return {
        id: overrides.id ?? 'patient-1',
        userId: overrides.userId ?? null,
        firstName: overrides.firstName ?? 'Ana',
        lastName: overrides.lastName ?? 'Krasniqi',
        dateOfBirth: overrides.dateOfBirth ?? new Date('1998-03-10T00:00:00.000Z'),
        gender: overrides.gender ?? 'FEMALE',
        phoneNumber: overrides.phoneNumber ?? '+38344111222',
        address: overrides.address ?? 'Prishtine',
        bloodType: overrides.bloodType ?? 'A+',
        isDeleted: overrides.isDeleted ?? false,
        createdAt: overrides.createdAt ?? new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-01-01T10:00:00.000Z'),
    };
}

function createDoctorUser() {
    return {
        id: 'doctor-user-1',
        email: 'doctor@example.com',
        roles: ['DOCTOR'],
    };
}

describe('Patient handlers', () => {
    const repository: jest.Mocked<PatientRepository> = {
        create: jest.fn(),
        findById: jest.fn(),
        findByIdForDoctorAppointments: jest.fn(),
        findByUserId: jest.fn(),
        findUserById: jest.fn(),
        findDoctorByUserId: jest.fn(),
        findMany: jest.fn(),
        findManyForDoctorAppointments: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a patient', async () => {
        const patient = createPatient();

        repository.create.mockResolvedValue(patient);

        const service = new PatientService(repository);
        const handler = new CreatePatientHandler(service);
        const command = new CreatePatientCommand({
            firstName: ' Ana ',
            lastName: ' Krasniqi ',
            dateOfBirth: '1998-03-10',
            gender: 'FEMALE',
            phoneNumber: '+38344111222',
            address: ' Prishtine ',
            bloodType: 'A+',
        });

        const result = await handler.execute(command);

        expect(repository.create).toHaveBeenCalledWith({
            firstName: 'Ana',
            lastName: 'Krasniqi',
            dateOfBirth: new Date('1998-03-10T00:00:00.000Z'),
            gender: 'FEMALE',
            phoneNumber: '+38344111222',
            address: 'Prishtine',
            bloodType: 'A+',
        });
        expect(result.id).toBe(patient.id);
    });

    it('should update a patient', async () => {
        const patient = createPatient({
            gender: 'Female',
        });
        const updatedPatient = createPatient({
            firstName: 'Anila',
            address: 'Peje',
            updatedAt: new Date('2026-01-02T10:00:00.000Z'),
        });

        repository.findById.mockResolvedValue(patient);
        repository.update.mockResolvedValue(updatedPatient);

        const service = new PatientService(repository);
        const handler = new UpdatePatientHandler(service);
        const command = new UpdatePatientCommand('patient-1', {
            firstName: ' Anila ',
            address: ' Peje ',
        });

        const result = await handler.execute(command);

        expect(repository.findById).toHaveBeenCalledWith('patient-1');
        expect(repository.update).toHaveBeenCalledWith('patient-1', {
            firstName: 'Anila',
            address: 'Peje',
        });
        expect(result.firstName).toBe('Anila');
    });

    it('should soft delete a patient', async () => {
        const patient = createPatient();

        repository.findById.mockResolvedValue(patient);
        repository.softDelete.mockResolvedValue({
            ...patient,
            isDeleted: true,
        });

        const service = new PatientService(repository);
        const handler = new DeletePatientHandler(service);

        await handler.execute(new DeletePatientCommand('patient-1'));

        expect(repository.findById).toHaveBeenCalledWith('patient-1');
        expect(repository.softDelete).toHaveBeenCalledWith('patient-1');
    });

    it('should return a patient by id', async () => {
        const patient = createPatient();

        repository.findById.mockResolvedValue(patient);

        const service = new PatientService(repository);
        const handler = new GetPatientHandler(service);
        const result = await handler.execute(new GetPatientQuery('patient-1'));

        expect(repository.findById).toHaveBeenCalledWith('patient-1');
        expect(result.id).toBe('patient-1');
    });

    it('should return paginated patients', async () => {
        const patient = createPatient();
        const secondPatient = createPatient({
            id: 'patient-2',
            firstName: 'Blerim',
            lastName: 'Hoxha',
            gender: 'MALE',
            bloodType: 'O+',
        });

        repository.findMany.mockResolvedValue([patient, secondPatient]);

        const service = new PatientService(repository);
        const handler = new GetPatientsHandler(service);
        const result = await handler.execute(new GetPatientsQuery({
            page: 1,
            limit: 5,
            sortBy: 'last_name',
            order: 'ASC',
            search: ' Ana Krasniqi ',
            bloodGroup: 'A+',
            gender: 'FEMALE',
        }));

        expect(repository.findMany).toHaveBeenCalledWith();
        expect(result).toEqual({
            data: [patient],
            page: 1,
            limit: 5,
            total: 1,
            totalPages: 1,
        });
    });

    it('should scope patient lists to patients with doctor appointments', async () => {
        const patient = createPatient();
        const otherPatient = createPatient({
            id: 'patient-2',
            firstName: 'Blerim',
            gender: 'MALE',
        });

        repository.findDoctorByUserId.mockResolvedValue({
            id: 'doctor-1',
            isActive: true,
        });
        repository.findManyForDoctorAppointments.mockResolvedValue([
            patient,
            otherPatient,
        ]);

        const service = new PatientService(repository);
        const handler = new GetPatientsHandler(service);
        const result = await handler.execute(new GetPatientsQuery({
            page: 1,
            limit: 10,
            sortBy: 'created_at',
            order: 'DESC',
            gender: 'FEMALE',
        }, createDoctorUser()));

        expect(repository.findDoctorByUserId).toHaveBeenCalledWith('doctor-user-1');
        expect(repository.findManyForDoctorAppointments).toHaveBeenCalledWith('doctor-1');
        expect(repository.findMany).not.toHaveBeenCalled();
        expect(result.data).toEqual([patient]);
    });

    it('should hide patients without appointments for the doctor', async () => {
        repository.findDoctorByUserId.mockResolvedValue({
            id: 'doctor-1',
            isActive: true,
        });
        repository.findByIdForDoctorAppointments.mockResolvedValue(null);

        const service = new PatientService(repository);
        const handler = new GetPatientHandler(service);

        await expect(
            handler.execute(new GetPatientQuery('patient-2', createDoctorUser())),
        ).rejects.toMatchObject({
            message: 'Patient not found',
            statusCode: 404,
        });

        expect(repository.findByIdForDoctorAppointments).toHaveBeenCalledWith(
            'patient-2',
            'doctor-1',
        );
        expect(repository.findById).not.toHaveBeenCalled();
    });

    it('should throw when deleting a missing patient', async () => {
        repository.findById.mockResolvedValue(null);

        const service = new PatientService(repository);
        const handler = new DeletePatientHandler(service);

        await expect(
            handler.execute(new DeletePatientCommand('missing-patient')),
        ).rejects.toBeInstanceOf(AppError);
        expect(repository.softDelete).not.toHaveBeenCalled();
    });
});
