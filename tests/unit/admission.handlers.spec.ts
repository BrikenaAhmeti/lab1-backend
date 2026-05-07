import { AppError } from '../../src/shared/core/errors/app-error';
import { CreateAdmissionCommand } from '../../src/modules/admissions/application/commands/create-admission.command';
import { DischargeAdmissionCommand } from '../../src/modules/admissions/application/commands/discharge-admission.command';
import { CreateAdmissionHandler } from '../../src/modules/admissions/application/handlers/create-admission.handler';
import { DischargeAdmissionHandler } from '../../src/modules/admissions/application/handlers/discharge-admission.handler';
import {
    AdmissionEntity,
    AdmissionReferenceEntity,
    AdmissionRoomEntity,
} from '../../src/modules/admissions/domain/admission.entity';
import { AdmissionRepository } from '../../src/modules/admissions/domain/admission.repository';
import { AdmissionService } from '../../src/modules/admissions/services/admission.service';

function createPatientReference(
    overrides: Partial<AdmissionReferenceEntity> = {},
): AdmissionReferenceEntity {
    return {
        id: overrides.id ?? 'patient-1',
    };
}

function createRoom(
    overrides: Partial<AdmissionRoomEntity> = {},
): AdmissionRoomEntity {
    return {
        id: overrides.id ?? 'room-1',
        roomNumber: overrides.roomNumber ?? '101',
        departmentId: overrides.departmentId ?? 'department-1',
        type: overrides.type ?? 'GENERAL',
        status: overrides.status ?? 'AVAILABLE',
        capacity: overrides.capacity ?? 2,
        department: overrides.department ?? {
            id: 'department-1',
            name: 'General Ward',
            location: 'Block A',
        },
    };
}

function createAdmission(
    overrides: Partial<AdmissionEntity> = {},
): AdmissionEntity {
    return {
        id: overrides.id ?? 'admission-1',
        patientId: overrides.patientId ?? 'patient-1',
        roomId: overrides.roomId ?? 'room-1',
        admissionDate:
            overrides.admissionDate ?? new Date('2026-05-07T10:00:00.000Z'),
        dischargeDate: overrides.dischargeDate ?? null,
        status: overrides.status ?? 'ACTIVE',
        patient: overrides.patient ?? {
            id: 'patient-1',
            firstName: 'Ana',
            lastName: 'Berisha',
        },
        room: overrides.room ?? createRoom(),
        createdAt: overrides.createdAt ?? new Date('2026-05-07T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-05-07T10:00:00.000Z'),
    };
}

describe('Admission handlers', () => {
    const repository: jest.Mocked<AdmissionRepository> = {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        findPatientById: jest.fn(),
        findRoomById: jest.fn(),
        findActiveByPatientId: jest.fn(),
        countActiveAdmissionsByRoomId: jest.fn(),
        update: jest.fn(),
        updateRoomStatus: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(
            new Date('2026-05-07T10:00:00.000Z'),
        );
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should admit a patient and mark the room as occupied when capacity becomes full', async () => {
        repository.findPatientById.mockResolvedValue(createPatientReference());
        repository.findRoomById.mockResolvedValue(createRoom({
            capacity: 1,
            status: 'AVAILABLE',
        }));
        repository.findActiveByPatientId.mockResolvedValue(null);
        repository.countActiveAdmissionsByRoomId
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(1);
        repository.create.mockResolvedValue(createAdmission({
            room: createRoom({
                capacity: 1,
                status: 'AVAILABLE',
            }),
        }));
        repository.findById.mockResolvedValue(createAdmission({
            room: createRoom({
                capacity: 1,
                status: 'OCCUPIED',
            }),
        }));
        repository.updateRoomStatus.mockResolvedValue();

        const service = new AdmissionService(repository);
        const handler = new CreateAdmissionHandler(service);
        const result = await handler.execute(
            new CreateAdmissionCommand({
                patientId: ' patient-1 ',
                roomId: ' room-1 ',
            }),
        );

        expect(repository.create).toHaveBeenCalledWith({
            patientId: 'patient-1',
            roomId: 'room-1',
            admissionDate: new Date('2026-05-07T10:00:00.000Z'),
            status: 'ACTIVE',
        });
        expect(repository.updateRoomStatus).toHaveBeenCalledWith(
            'room-1',
            'OCCUPIED',
        );
        expect(result).toMatchObject({
            status: 'ACTIVE',
            room: {
                status: 'OCCUPIED',
            },
        });
    });

    it('should reject admission when the patient already has an active admission', async () => {
        repository.findPatientById.mockResolvedValue(createPatientReference());
        repository.findRoomById.mockResolvedValue(createRoom());
        repository.findActiveByPatientId.mockResolvedValue(createAdmission());

        const service = new AdmissionService(repository);
        const handler = new CreateAdmissionHandler(service);

        await expect(
            handler.execute(
                new CreateAdmissionCommand({
                    patientId: 'patient-1',
                    roomId: 'room-1',
                }),
            ),
        ).rejects.toMatchObject({
            message: 'Patient is already admitted',
            statusCode: 409,
        });

        expect(repository.create).not.toHaveBeenCalled();
    });

    it('should reject admission when the room is already full', async () => {
        repository.findPatientById.mockResolvedValue(createPatientReference());
        repository.findRoomById.mockResolvedValue(createRoom({
            capacity: 1,
        }));
        repository.findActiveByPatientId.mockResolvedValue(null);
        repository.countActiveAdmissionsByRoomId.mockResolvedValue(1);

        const service = new AdmissionService(repository);
        const handler = new CreateAdmissionHandler(service);

        await expect(
            handler.execute(
                new CreateAdmissionCommand({
                    patientId: 'patient-1',
                    roomId: 'room-1',
                }),
            ),
        ).rejects.toMatchObject({
            message: 'Room has no available capacity',
            statusCode: 409,
        });

        expect(repository.create).not.toHaveBeenCalled();
        expect(repository.updateRoomStatus).not.toHaveBeenCalled();
    });

    it('should discharge an active admission and free the room capacity', async () => {
        repository.findById
            .mockResolvedValueOnce(createAdmission({
                room: createRoom({
                    capacity: 2,
                    status: 'OCCUPIED',
                }),
            }))
            .mockResolvedValueOnce(createAdmission({
                status: 'DISCHARGED',
                dischargeDate: new Date('2026-05-07T10:00:00.000Z'),
                room: createRoom({
                    capacity: 2,
                    status: 'AVAILABLE',
                }),
            }));
        repository.findRoomById.mockResolvedValue(createRoom({
            capacity: 2,
            status: 'OCCUPIED',
        }));
        repository.countActiveAdmissionsByRoomId.mockResolvedValue(0);
        repository.update.mockResolvedValue(createAdmission({
            status: 'DISCHARGED',
            dischargeDate: new Date('2026-05-07T10:00:00.000Z'),
        }));
        repository.updateRoomStatus.mockResolvedValue();

        const service = new AdmissionService(repository);
        const handler = new DischargeAdmissionHandler(service);
        const result = await handler.execute(
            new DischargeAdmissionCommand('admission-1', {}),
        );

        expect(repository.update).toHaveBeenCalledWith('admission-1', {
            dischargeDate: new Date('2026-05-07T10:00:00.000Z'),
            status: 'DISCHARGED',
        });
        expect(repository.updateRoomStatus).toHaveBeenCalledWith(
            'room-1',
            'AVAILABLE',
        );
        expect(result).toMatchObject({
            status: 'DISCHARGED',
            dischargeDate: new Date('2026-05-07T10:00:00.000Z'),
            room: {
                status: 'AVAILABLE',
            },
        });
    });

    it('should reject discharge when the admission is already discharged', async () => {
        repository.findById.mockResolvedValue(createAdmission({
            status: 'DISCHARGED',
            dischargeDate: new Date('2026-05-07T09:00:00.000Z'),
        }));

        const service = new AdmissionService(repository);
        const handler = new DischargeAdmissionHandler(service);

        await expect(
            handler.execute(
                new DischargeAdmissionCommand('admission-1', {}),
            ),
        ).rejects.toBeInstanceOf(AppError);

        expect(repository.update).not.toHaveBeenCalled();
    });
});
