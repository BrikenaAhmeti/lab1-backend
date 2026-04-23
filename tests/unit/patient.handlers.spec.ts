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

describe('Patient handlers', () => {
    const repository: jest.Mocked<PatientRepository> = {
        create: jest.fn(),
        findById: jest.fn(),
        findMany: jest.fn(),
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
        const patient = createPatient();
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

        repository.findMany.mockResolvedValue({
            items: [patient],
            total: 1,
        });

        const service = new PatientService(repository);
        const handler = new GetPatientsHandler(service);
        const result = await handler.execute(new GetPatientsQuery(2, 5, ' Ana '));

        expect(repository.findMany).toHaveBeenCalledWith({
            page: 2,
            limit: 5,
            search: 'Ana',
        });
        expect(result).toEqual({
            items: [patient],
            page: 2,
            limit: 5,
            total: 1,
            totalPages: 1,
        });
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
