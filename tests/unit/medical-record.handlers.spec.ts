import { CreateMedicalRecordCommand } from '../../src/modules/medical-records/application/commands/create-medical-record.command';
import { DeleteMedicalRecordCommand } from '../../src/modules/medical-records/application/commands/delete-medical-record.command';
import { UpdateMedicalRecordCommand } from '../../src/modules/medical-records/application/commands/update-medical-record.command';
import { CreateMedicalRecordHandler } from '../../src/modules/medical-records/application/handlers/create-medical-record.handler';
import { DeleteMedicalRecordHandler } from '../../src/modules/medical-records/application/handlers/delete-medical-record.handler';
import { GetMedicalRecordByIdHandler } from '../../src/modules/medical-records/application/handlers/get-medical-record-by-id.handler';
import { GetMedicalRecordPrescriptionsHandler } from '../../src/modules/medical-records/application/handlers/get-medical-record-prescriptions.handler';
import { GetMedicalRecordsHandler } from '../../src/modules/medical-records/application/handlers/get-medical-records.handler';
import { UpdateMedicalRecordHandler } from '../../src/modules/medical-records/application/handlers/update-medical-record.handler';
import { GetMedicalRecordByIdQuery } from '../../src/modules/medical-records/application/queries/get-medical-record-by-id.query';
import { GetMedicalRecordPrescriptionsQuery } from '../../src/modules/medical-records/application/queries/get-medical-record-prescriptions.query';
import { GetMedicalRecordsQuery } from '../../src/modules/medical-records/application/queries/get-medical-records.query';
import {
    MedicalRecordDoctorEntity,
    MedicalRecordEntity,
    MedicalRecordPatientEntity,
    MedicalRecordPrescriptionEntity,
    MedicalRecordReferenceEntity,
} from '../../src/modules/medical-records/domain/medical-record.entity';
import { MedicalRecordRepository } from '../../src/modules/medical-records/domain/medical-record.repository';
import { MedicalRecordService } from '../../src/modules/medical-records/services/medical-record.service';

function createPatient(
    overrides: Partial<MedicalRecordPatientEntity> = {},
): MedicalRecordPatientEntity {
    return {
        id: overrides.id ?? 'patient-1',
        firstName: overrides.firstName ?? 'Ana',
        lastName: overrides.lastName ?? 'Krasniqi',
    };
}

function createDoctor(
    overrides: Partial<MedicalRecordDoctorEntity> = {},
): MedicalRecordDoctorEntity {
    return {
        id: overrides.id ?? 'doctor-1',
        firstName: overrides.firstName ?? 'Arben',
        lastName: overrides.lastName ?? 'Hoxha',
        specialization: overrides.specialization ?? 'Cardiology',
    };
}

function createReference(
    overrides: Partial<MedicalRecordReferenceEntity> = {},
): MedicalRecordReferenceEntity {
    return {
        id: overrides.id ?? 'reference-1',
    };
}

function createPrescription(
    overrides: Partial<MedicalRecordPrescriptionEntity> = {},
): MedicalRecordPrescriptionEntity {
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

function createMedicalRecord(
    overrides: Partial<MedicalRecordEntity> = {},
): MedicalRecordEntity {
    return {
        id: overrides.id ?? 'medical-record-1',
        patientId: overrides.patientId ?? 'patient-1',
        doctorId: overrides.doctorId ?? 'doctor-1',
        diagnosis: overrides.diagnosis ?? 'Hypertension',
        treatment: overrides.treatment ?? 'Lifestyle changes',
        prescriptionsText: overrides.prescriptionsText ?? 'Paracetamol 500mg',
        recordDate: overrides.recordDate ?? new Date('2026-05-01T00:00:00.000Z'),
        patient: overrides.patient ?? createPatient(),
        doctor: overrides.doctor ?? createDoctor(),
        createdAt: overrides.createdAt ?? new Date('2026-05-01T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-05-01T10:00:00.000Z'),
    };
}

describe('Medical record handlers', () => {
    const repository: jest.Mocked<MedicalRecordRepository> = {
        create: jest.fn(),
        findManyByPatientId: jest.fn(),
        findById: jest.fn(),
        findPatientById: jest.fn(),
        findDoctorById: jest.fn(),
        findPrescriptionsByMedicalRecordId: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a medical record when patient and doctor exist', async () => {
        const medicalRecord = createMedicalRecord();

        repository.findPatientById.mockResolvedValue(createReference({
            id: 'patient-1',
        }));
        repository.findDoctorById.mockResolvedValue(createReference({
            id: 'doctor-1',
        }));
        repository.create.mockResolvedValue(medicalRecord);

        const service = new MedicalRecordService(repository);
        const handler = new CreateMedicalRecordHandler(service);
        const command = new CreateMedicalRecordCommand({
            patientId: ' patient-1 ',
            doctorId: ' doctor-1 ',
            diagnosis: ' Hypertension ',
            treatment: ' Lifestyle changes ',
            prescriptionsText: ' Paracetamol 500mg ',
            date: '2026-05-01',
        });

        const result = await handler.execute(command);

        expect(repository.findPatientById).toHaveBeenCalledWith('patient-1');
        expect(repository.findDoctorById).toHaveBeenCalledWith('doctor-1');
        expect(repository.create).toHaveBeenCalledWith({
            patientId: 'patient-1',
            doctorId: 'doctor-1',
            diagnosis: 'Hypertension',
            treatment: 'Lifestyle changes',
            prescriptionsText: 'Paracetamol 500mg',
            recordDate: new Date('2026-05-01T00:00:00.000Z'),
        });
        expect(result.id).toBe('medical-record-1');
    });

    it('should reject medical record creation when patient does not exist', async () => {
        repository.findPatientById.mockResolvedValue(null);

        const service = new MedicalRecordService(repository);
        const handler = new CreateMedicalRecordHandler(service);

        await expect(
            handler.execute(
                new CreateMedicalRecordCommand({
                    patientId: 'missing-patient',
                    doctorId: 'doctor-1',
                    diagnosis: 'Hypertension',
                    treatment: 'Rest',
                    date: '2026-05-01',
                }),
            ),
        ).rejects.toMatchObject({
            message: 'Patient not found',
            statusCode: 404,
        });

        expect(repository.create).not.toHaveBeenCalled();
    });

    it('should return patient medical history', async () => {
        const medicalRecords = [
            createMedicalRecord(),
            createMedicalRecord({
                id: 'medical-record-2',
                recordDate: new Date('2026-04-28T00:00:00.000Z'),
            }),
        ];

        repository.findPatientById.mockResolvedValue(createReference({
            id: 'patient-1',
        }));
        repository.findManyByPatientId.mockResolvedValue(medicalRecords);

        const service = new MedicalRecordService(repository);
        const handler = new GetMedicalRecordsHandler(service);
        const result = await handler.execute(
            new GetMedicalRecordsQuery('patient-1'),
        );

        expect(repository.findManyByPatientId).toHaveBeenCalledWith('patient-1');
        expect(result).toEqual(medicalRecords);
    });

    it('should return a medical record by id', async () => {
        const medicalRecord = createMedicalRecord();

        repository.findById.mockResolvedValue(medicalRecord);

        const service = new MedicalRecordService(repository);
        const handler = new GetMedicalRecordByIdHandler(service);
        const result = await handler.execute(
            new GetMedicalRecordByIdQuery('medical-record-1'),
        );

        expect(repository.findById).toHaveBeenCalledWith('medical-record-1');
        expect(result.id).toBe('medical-record-1');
    });

    it('should update a medical record', async () => {
        const medicalRecord = createMedicalRecord();
        const updatedMedicalRecord = createMedicalRecord({
            treatment: 'Updated treatment',
            prescriptionsText: null,
            updatedAt: new Date('2026-05-02T10:00:00.000Z'),
        });

        repository.findById.mockResolvedValue(medicalRecord);
        repository.update.mockResolvedValue(updatedMedicalRecord);

        const service = new MedicalRecordService(repository);
        const handler = new UpdateMedicalRecordHandler(service);
        const command = new UpdateMedicalRecordCommand('medical-record-1', {
            treatment: ' Updated treatment ',
            prescriptionsText: '   ',
        });

        const result = await handler.execute(command);

        expect(repository.findById).toHaveBeenCalledWith('medical-record-1');
        expect(repository.update).toHaveBeenCalledWith('medical-record-1', {
            treatment: 'Updated treatment',
            prescriptionsText: null,
        });
        expect(result.treatment).toBe('Updated treatment');
    });

    it('should delete a medical record', async () => {
        const medicalRecord = createMedicalRecord();

        repository.findById.mockResolvedValue(medicalRecord);
        repository.delete.mockResolvedValue(medicalRecord);

        const service = new MedicalRecordService(repository);
        const handler = new DeleteMedicalRecordHandler(service);

        await handler.execute(new DeleteMedicalRecordCommand('medical-record-1'));

        expect(repository.findById).toHaveBeenCalledWith('medical-record-1');
        expect(repository.delete).toHaveBeenCalledWith('medical-record-1');
    });

    it('should return linked prescriptions', async () => {
        const medicalRecord = createMedicalRecord();
        const prescriptions = [
            createPrescription(),
            createPrescription({
                id: 'prescription-2',
                medicine: 'Ibuprofen',
            }),
        ];

        repository.findById.mockResolvedValue(medicalRecord);
        repository.findPrescriptionsByMedicalRecordId.mockResolvedValue(
            prescriptions,
        );

        const service = new MedicalRecordService(repository);
        const handler = new GetMedicalRecordPrescriptionsHandler(service);
        const result = await handler.execute(
            new GetMedicalRecordPrescriptionsQuery('medical-record-1'),
        );

        expect(repository.findPrescriptionsByMedicalRecordId).toHaveBeenCalledWith(
            'medical-record-1',
        );
        expect(result).toEqual(prescriptions);
    });
});
