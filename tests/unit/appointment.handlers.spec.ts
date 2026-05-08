import { AppError } from '../../src/shared/core/errors/app-error';
import { CreateAppointmentCommand } from '../../src/modules/appointments/application/commands/create-appointment.command';
import { DeleteAppointmentCommand } from '../../src/modules/appointments/application/commands/delete-appointment.command';
import { UpdateAppointmentCommand } from '../../src/modules/appointments/application/commands/update-appointment.command';
import { CreateAppointmentHandler } from '../../src/modules/appointments/application/handlers/create-appointment.handler';
import { DeleteAppointmentHandler } from '../../src/modules/appointments/application/handlers/delete-appointment.handler';
import { GetAppointmentsHandler } from '../../src/modules/appointments/application/handlers/get-appointments.handler';
import { GetTodayAppointmentsHandler } from '../../src/modules/appointments/application/handlers/get-today-appointments.handler';
import { UpdateAppointmentHandler } from '../../src/modules/appointments/application/handlers/update-appointment.handler';
import { GetAppointmentsQuery } from '../../src/modules/appointments/application/queries/get-appointments.query';
import { GetTodayAppointmentsQuery } from '../../src/modules/appointments/application/queries/get-today-appointments.query';
import {
    AppointmentDoctorEntity,
    AppointmentEntity,
    AppointmentPatientEntity,
    AppointmentReferenceEntity,
} from '../../src/modules/appointments/domain/appointment.entity';
import { AppointmentRepository } from '../../src/modules/appointments/domain/appointment.repository';
import { AppointmentService } from '../../src/modules/appointments/services/appointment.service';

function createPatient(
    overrides: Partial<AppointmentPatientEntity> = {},
): AppointmentPatientEntity {
    return {
        id: overrides.id ?? 'patient-1',
        firstName: overrides.firstName ?? 'Ana',
        lastName: overrides.lastName ?? 'Krasniqi',
    };
}

function createDoctor(
    overrides: Partial<AppointmentDoctorEntity> = {},
): AppointmentDoctorEntity {
    return {
        id: overrides.id ?? 'doctor-1',
        firstName: overrides.firstName ?? 'Arben',
        lastName: overrides.lastName ?? 'Hoxha',
        specialization: overrides.specialization ?? 'Cardiology',
    };
}

function createReference(
    overrides: Partial<AppointmentReferenceEntity> = {},
): AppointmentReferenceEntity {
    return {
        id: overrides.id ?? 'reference-1',
    };
}

function createAppointment(
    overrides: Partial<AppointmentEntity> = {},
): AppointmentEntity {
    return {
        id: overrides.id ?? 'appointment-1',
        patientId: overrides.patientId ?? 'patient-1',
        doctorId: overrides.doctorId ?? 'doctor-1',
        appointmentDate:
            overrides.appointmentDate ?? new Date('2026-05-05T00:00:00.000Z'),
        appointmentTime: overrides.appointmentTime ?? '14:30',
        status: overrides.status ?? 'Scheduled',
        notes: overrides.notes ?? 'Initial consultation',
        patient: overrides.patient ?? createPatient(),
        doctor: overrides.doctor ?? createDoctor(),
        createdAt: overrides.createdAt ?? new Date('2026-05-04T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-05-04T10:00:00.000Z'),
    };
}

describe('Appointment handlers', () => {
    const repository: jest.Mocked<AppointmentRepository> = {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        findPatientById: jest.fn(),
        findDoctorById: jest.fn(),
        findConflict: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(
            new Date('2026-05-04T10:00:00.000Z'),
        );
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should create an appointment when patient and doctor exist', async () => {
        const appointment = createAppointment();

        repository.findPatientById.mockResolvedValue(createReference({
            id: 'patient-1',
        }));
        repository.findDoctorById.mockResolvedValue(createReference({
            id: 'doctor-1',
        }));
        repository.findConflict.mockResolvedValue(null);
        repository.create.mockResolvedValue(appointment);

        const service = new AppointmentService(repository);
        const handler = new CreateAppointmentHandler(service);
        const command = new CreateAppointmentCommand({
            patientId: ' patient-1 ',
            doctorId: ' doctor-1 ',
            date: '2026-05-05',
            time: '14:30',
            notes: ' Initial consultation ',
        });

        const result = await handler.execute(command);

        expect(repository.findPatientById).toHaveBeenCalledWith('patient-1');
        expect(repository.findDoctorById).toHaveBeenCalledWith('doctor-1');
        expect(repository.findConflict).toHaveBeenCalledWith({
            doctorId: 'doctor-1',
            appointmentDate: new Date('2026-05-05T00:00:00.000Z'),
            appointmentTime: '14:30',
            excludeAppointmentId: undefined,
        });
        expect(repository.create).toHaveBeenCalledWith({
            patientId: 'patient-1',
            doctorId: 'doctor-1',
            appointmentDate: new Date('2026-05-05T00:00:00.000Z'),
            appointmentTime: '14:30',
            status: 'Scheduled',
            notes: 'Initial consultation',
        });
        expect(result.id).toBe('appointment-1');
    });

    it('should reject appointment creation when the slot is already taken', async () => {
        repository.findPatientById.mockResolvedValue(createReference({
            id: 'patient-1',
        }));
        repository.findDoctorById.mockResolvedValue(createReference({
            id: 'doctor-1',
        }));
        repository.findConflict.mockResolvedValue(createAppointment({
            id: 'appointment-2',
        }));

        const service = new AppointmentService(repository);
        const handler = new CreateAppointmentHandler(service);

        await expect(
            handler.execute(
                new CreateAppointmentCommand({
                    patientId: 'patient-1',
                    doctorId: 'doctor-1',
                    date: '2026-05-05',
                    time: '14:30',
                }),
            ),
        ).rejects.toMatchObject({
            message: 'Doctor already has an appointment at this date and time',
            statusCode: 409,
        });

        expect(repository.create).not.toHaveBeenCalled();
    });

    it('should reject appointment creation in the past', async () => {
        repository.findPatientById.mockResolvedValue(createReference({
            id: 'patient-1',
        }));
        repository.findDoctorById.mockResolvedValue(createReference({
            id: 'doctor-1',
        }));

        const service = new AppointmentService(repository);
        const handler = new CreateAppointmentHandler(service);

        await expect(
            handler.execute(
                new CreateAppointmentCommand({
                    patientId: 'patient-1',
                    doctorId: 'doctor-1',
                    date: '2026-05-03',
                    time: '09:00',
                }),
            ),
        ).rejects.toMatchObject({
            message: 'Appointment date cannot be in the past',
            statusCode: 400,
        });

        expect(repository.findConflict).not.toHaveBeenCalled();
        expect(repository.create).not.toHaveBeenCalled();
    });

    it('should reject rescheduling when another appointment already exists', async () => {
        const existingAppointment = createAppointment();

        repository.findById.mockResolvedValue(existingAppointment);
        repository.findConflict.mockResolvedValue(createAppointment({
            id: 'appointment-2',
            patientId: 'patient-2',
        }));

        const service = new AppointmentService(repository);
        const handler = new UpdateAppointmentHandler(service);

        await expect(
            handler.execute(
                new UpdateAppointmentCommand('appointment-1', {
                    date: '2026-05-06',
                    time: '15:00',
                }),
            ),
        ).rejects.toMatchObject({
            message: 'Doctor already has an appointment at this date and time',
            statusCode: 409,
        });

        expect(repository.findConflict).toHaveBeenCalledWith({
            doctorId: 'doctor-1',
            appointmentDate: new Date('2026-05-06T00:00:00.000Z'),
            appointmentTime: '15:00',
            excludeAppointmentId: 'appointment-1',
        });
        expect(repository.update).not.toHaveBeenCalled();
    });

    it('should reject invalid status transitions', async () => {
        repository.findById.mockResolvedValue(createAppointment({
            status: 'Completed',
        }));

        const service = new AppointmentService(repository);
        const handler = new UpdateAppointmentHandler(service);

        await expect(
            handler.execute(
                new UpdateAppointmentCommand('appointment-1', {
                    status: 'Cancelled',
                }),
            ),
        ).rejects.toBeInstanceOf(AppError);

        expect(repository.update).not.toHaveBeenCalled();
    });

    it('should cancel a scheduled appointment', async () => {
        repository.findById.mockResolvedValue(createAppointment());
        repository.update.mockResolvedValue(createAppointment({
            status: 'Cancelled',
        }));

        const service = new AppointmentService(repository);
        const handler = new DeleteAppointmentHandler(service);

        await handler.execute(new DeleteAppointmentCommand('appointment-1'));

        expect(repository.update).toHaveBeenCalledWith('appointment-1', {
            status: 'Cancelled',
        });
    });

    it('should return appointments filtered by date range and status', async () => {
        const appointments = [
            createAppointment(),
            createAppointment({
                id: 'appointment-2',
                appointmentDate: new Date('2026-05-07T00:00:00.000Z'),
                status: 'Completed',
            }),
        ];

        repository.findMany.mockResolvedValue(appointments);

        const service = new AppointmentService(repository);
        const handler = new GetAppointmentsHandler(service);
        const result = await handler.execute(new GetAppointmentsQuery({
            page: 1,
            limit: 10,
            sortBy: 'date',
            order: 'ASC',
            status: 'Completed',
            from: '2026-05-06',
            to: '2026-05-08',
        }));

        expect(repository.findMany).toHaveBeenCalledWith({
            appointmentDate: undefined,
            doctorId: undefined,
            patientId: undefined,
            status: 'Completed',
        });
        expect(result).toEqual({
            data: [appointments[1]],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
        });
    });

    it('should return today appointments', async () => {
        const appointments = [
            createAppointment(),
            createAppointment({
                id: 'appointment-2',
                appointmentTime: '16:00',
            }),
        ];

        repository.findMany.mockResolvedValue(appointments);

        const service = new AppointmentService(repository);
        const handler = new GetTodayAppointmentsHandler(service);
        const result = await handler.execute(new GetTodayAppointmentsQuery({
            page: 1,
            limit: 10,
            sortBy: 'time',
            order: 'ASC',
        }));

        expect(repository.findMany).toHaveBeenCalledWith({
            appointmentDate: new Date('2026-05-04T00:00:00.000Z'),
            doctorId: undefined,
            patientId: undefined,
            status: undefined,
        });
        expect(result).toEqual({
            data: appointments,
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
        });
    });
});
