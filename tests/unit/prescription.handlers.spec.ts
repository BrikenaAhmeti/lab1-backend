import { CreatePrescriptionCommand } from '../../src/modules/prescriptions/application/commands/create-prescription.command';
import { DeletePrescriptionCommand } from '../../src/modules/prescriptions/application/commands/delete-prescription.command';
import { UpdatePrescriptionCommand } from '../../src/modules/prescriptions/application/commands/update-prescription.command';
import { CreatePrescriptionHandler } from '../../src/modules/prescriptions/application/handlers/create-prescription.handler';
import { DeletePrescriptionHandler } from '../../src/modules/prescriptions/application/handlers/delete-prescription.handler';
import { GetPrescriptionByIdHandler } from '../../src/modules/prescriptions/application/handlers/get-prescription-by-id.handler';
import { GetPrescriptionsHandler } from '../../src/modules/prescriptions/application/handlers/get-prescriptions.handler';
import { UpdatePrescriptionHandler } from '../../src/modules/prescriptions/application/handlers/update-prescription.handler';
import { GetPrescriptionByIdQuery } from '../../src/modules/prescriptions/application/queries/get-prescription-by-id.query';
import { GetPrescriptionsQuery } from '../../src/modules/prescriptions/application/queries/get-prescriptions.query';
import {
    PrescriptionEntity,
    PrescriptionReferenceEntity,
} from '../../src/modules/prescriptions/domain/prescription.entity';
import { PrescriptionRepository } from '../../src/modules/prescriptions/domain/prescription.repository';
import { PrescriptionService } from '../../src/modules/prescriptions/services/prescription.service';

function createReference(
    overrides: Partial<PrescriptionReferenceEntity> = {},
): PrescriptionReferenceEntity {
    return {
        id: overrides.id ?? 'reference-1',
    };
}

function createPrescription(
    overrides: Partial<PrescriptionEntity> = {},
): PrescriptionEntity {
    return {
        id: overrides.id ?? 'prescription-1',
        medicalRecordId: overrides.medicalRecordId ?? 'medical-record-1',
        medicine: overrides.medicine ?? 'Paracetamol',
        dosage: overrides.dosage ?? '500mg',
        duration: overrides.duration ?? '5 days',
        instructions: overrides.instructions ?? 'After meals',
        createdAt: overrides.createdAt ?? new Date('2026-05-01T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-05-01T10:00:00.000Z'),
    };
}

describe('Prescription handlers', () => {
    const repository: jest.Mocked<PrescriptionRepository> = {
        create: jest.fn(),
        findManyByMedicalRecordId: jest.fn(),
        findById: jest.fn(),
        findMedicalRecordById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a prescription when medical record exists', async () => {
        const prescription = createPrescription();

        repository.findMedicalRecordById.mockResolvedValue(createReference({
            id: 'medical-record-1',
        }));
        repository.create.mockResolvedValue(prescription);

        const service = new PrescriptionService(repository);
        const handler = new CreatePrescriptionHandler(service);
        const command = new CreatePrescriptionCommand({
            medicalRecordId: ' medical-record-1 ',
            medicine: ' Paracetamol ',
            dosage: ' 500mg ',
            duration: ' 5 days ',
            instructions: ' After meals ',
        });

        const result = await handler.execute(command);

        expect(repository.findMedicalRecordById).toHaveBeenCalledWith(
            'medical-record-1',
        );
        expect(repository.create).toHaveBeenCalledWith({
            medicalRecordId: 'medical-record-1',
            medicine: 'Paracetamol',
            dosage: '500mg',
            duration: '5 days',
            instructions: 'After meals',
        });
        expect(result.id).toBe('prescription-1');
    });

    it('should reject prescription creation when medical record does not exist', async () => {
        repository.findMedicalRecordById.mockResolvedValue(null);

        const service = new PrescriptionService(repository);
        const handler = new CreatePrescriptionHandler(service);

        await expect(
            handler.execute(
                new CreatePrescriptionCommand({
                    medicalRecordId: 'missing-record',
                    medicine: 'Paracetamol',
                    dosage: '500mg',
                    duration: '5 days',
                }),
            ),
        ).rejects.toMatchObject({
            message: 'Medical record not found',
            statusCode: 404,
        });

        expect(repository.create).not.toHaveBeenCalled();
    });

    it('should return prescriptions by medical record id', async () => {
        const prescriptions = [
            createPrescription(),
            createPrescription({
                id: 'prescription-2',
                medicine: 'Ibuprofen',
            }),
        ];

        repository.findMedicalRecordById.mockResolvedValue(createReference({
            id: 'medical-record-1',
        }));
        repository.findManyByMedicalRecordId.mockResolvedValue(prescriptions);

        const service = new PrescriptionService(repository);
        const handler = new GetPrescriptionsHandler(service);
        const result = await handler.execute(
            new GetPrescriptionsQuery({
                page: 1,
                limit: 10,
                sortBy: 'created_at',
                order: 'DESC',
                medicalRecordId: 'medical-record-1',
            }),
        );

        expect(repository.findManyByMedicalRecordId).toHaveBeenCalledWith(
            'medical-record-1',
        );
        expect(result).toEqual({
            data: prescriptions,
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
        });
    });

    it('should return a prescription by id', async () => {
        const prescription = createPrescription();

        repository.findById.mockResolvedValue(prescription);

        const service = new PrescriptionService(repository);
        const handler = new GetPrescriptionByIdHandler(service);
        const result = await handler.execute(
            new GetPrescriptionByIdQuery('prescription-1'),
        );

        expect(repository.findById).toHaveBeenCalledWith('prescription-1');
        expect(result.id).toBe('prescription-1');
    });

    it('should update a prescription', async () => {
        const prescription = createPrescription();
        const updatedPrescription = createPrescription({
            medicine: 'Ibuprofen',
            instructions: null,
            updatedAt: new Date('2026-05-02T10:00:00.000Z'),
        });

        repository.findById.mockResolvedValue(prescription);
        repository.update.mockResolvedValue(updatedPrescription);

        const service = new PrescriptionService(repository);
        const handler = new UpdatePrescriptionHandler(service);
        const command = new UpdatePrescriptionCommand('prescription-1', {
            medicine: ' Ibuprofen ',
            instructions: '   ',
        });

        const result = await handler.execute(command);

        expect(repository.findById).toHaveBeenCalledWith('prescription-1');
        expect(repository.update).toHaveBeenCalledWith('prescription-1', {
            medicine: 'Ibuprofen',
            instructions: null,
        });
        expect(result.medicine).toBe('Ibuprofen');
    });

    it('should delete a prescription', async () => {
        const prescription = createPrescription();

        repository.findById.mockResolvedValue(prescription);
        repository.delete.mockResolvedValue(prescription);

        const service = new PrescriptionService(repository);
        const handler = new DeletePrescriptionHandler(service);

        await handler.execute(new DeletePrescriptionCommand('prescription-1'));

        expect(repository.findById).toHaveBeenCalledWith('prescription-1');
        expect(repository.delete).toHaveBeenCalledWith('prescription-1');
    });
});
