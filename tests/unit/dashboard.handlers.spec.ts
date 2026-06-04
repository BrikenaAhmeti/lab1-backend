import { GetDashboardActiveAdmissionsHandler } from '../../src/modules/dashboard/application/handlers/get-dashboard-active-admissions.handler';
import { GetDashboardStatsHandler } from '../../src/modules/dashboard/application/handlers/get-dashboard-stats.handler';
import { GetDashboardTodayAppointmentsHandler } from '../../src/modules/dashboard/application/handlers/get-dashboard-today-appointments.handler';
import { GetDashboardActiveAdmissionsQuery } from '../../src/modules/dashboard/application/queries/get-dashboard-active-admissions.query';
import { GetDashboardStatsQuery } from '../../src/modules/dashboard/application/queries/get-dashboard-stats.query';
import { GetDashboardTodayAppointmentsQuery } from '../../src/modules/dashboard/application/queries/get-dashboard-today-appointments.query';
import {
    DashboardActiveAdmissionEntity,
    DashboardStatsEntity,
    DashboardTodayAppointmentEntity,
} from '../../src/modules/dashboard/domain/dashboard.entity';
import { DashboardRepository } from '../../src/modules/dashboard/domain/dashboard.repository';
import { DashboardService } from '../../src/modules/dashboard/services/dashboard.service';

function createStats(
    overrides: Partial<DashboardStatsEntity> = {},
): DashboardStatsEntity {
    return {
        appointmentsToday: overrides.appointmentsToday ?? 4,
        availableRooms: overrides.availableRooms ?? 8,
        admittedPatients: overrides.admittedPatients ?? 3,
        totalPatients: overrides.totalPatients ?? 25,
        totalDoctors: overrides.totalDoctors ?? 11,
        pendingInvoicesAmount: overrides.pendingInvoicesAmount ?? 540.5,
    };
}

function createTodayAppointment(
    overrides: Partial<DashboardTodayAppointmentEntity> = {},
): DashboardTodayAppointmentEntity {
    return {
        id: overrides.id ?? 'appointment-1',
        patientId: overrides.patientId ?? 'patient-1',
        doctorId: overrides.doctorId ?? 'doctor-1',
        appointmentDate:
            overrides.appointmentDate ?? new Date('2026-05-08T00:00:00.000Z'),
        appointmentTime: overrides.appointmentTime ?? '09:30',
        status: overrides.status ?? 'Scheduled',
        notes: overrides.notes ?? 'Follow up',
        patient: overrides.patient ?? {
            id: 'patient-1',
            firstName: 'Ana',
            lastName: 'Krasniqi',
        },
        doctor: overrides.doctor ?? {
            id: 'doctor-1',
            firstName: 'Arben',
            lastName: 'Hoxha',
            specialization: 'Cardiology',
        },
        createdAt: overrides.createdAt ?? new Date('2026-05-07T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-05-07T10:00:00.000Z'),
    };
}

function createActiveAdmission(
    overrides: Partial<DashboardActiveAdmissionEntity> = {},
): DashboardActiveAdmissionEntity {
    return {
        id: overrides.id ?? 'admission-1',
        patientId: overrides.patientId ?? 'patient-1',
        roomId: overrides.roomId ?? 'room-1',
        admissionDate:
            overrides.admissionDate ?? new Date('2026-05-07T08:00:00.000Z'),
        dischargeDate: overrides.dischargeDate ?? null,
        status: overrides.status ?? 'ACTIVE',
        patient: overrides.patient ?? {
            id: 'patient-1',
            firstName: 'Ana',
            lastName: 'Krasniqi',
        },
        room: overrides.room ?? {
            id: 'room-1',
            roomNumber: '101',
            departmentId: 'department-1',
            type: 'GENERAL',
            status: 'OCCUPIED',
            capacity: 2,
            department: {
                id: 'department-1',
                name: 'Cardiology',
                location: 'First Floor',
            },
        },
        createdAt: overrides.createdAt ?? new Date('2026-05-07T08:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-05-07T08:00:00.000Z'),
    };
}

describe('Dashboard handlers', () => {
    const repository: jest.Mocked<DashboardRepository> = {
        getStats: jest.fn(),
        getTodayAppointments: jest.fn(),
        getActiveAdmissions: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(new Date(2026, 4, 8, 12, 0, 0));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should return dashboard stats', async () => {
        repository.getStats.mockResolvedValue(createStats());

        const service = new DashboardService(repository);
        const handler = new GetDashboardStatsHandler(service);
        const result = await handler.execute(new GetDashboardStatsQuery());

        expect(repository.getStats).toHaveBeenCalledWith(
            new Date('2026-05-08T00:00:00.000Z'),
        );
        expect(result).toEqual(createStats());
    });

    it('should return today appointments for the dashboard', async () => {
        const appointments = [createTodayAppointment()];
        repository.getTodayAppointments.mockResolvedValue(appointments);

        const service = new DashboardService(repository);
        const handler = new GetDashboardTodayAppointmentsHandler(service);
        const result = await handler.execute(
            new GetDashboardTodayAppointmentsQuery(),
        );

        expect(repository.getTodayAppointments).toHaveBeenCalledWith(
            new Date('2026-05-08T00:00:00.000Z'),
        );
        expect(result).toEqual(appointments);
    });

    it('should return active admissions for the dashboard', async () => {
        const admissions = [createActiveAdmission()];
        repository.getActiveAdmissions.mockResolvedValue(admissions);

        const service = new DashboardService(repository);
        const handler = new GetDashboardActiveAdmissionsHandler(service);
        const result = await handler.execute(
            new GetDashboardActiveAdmissionsQuery(),
        );

        expect(repository.getActiveAdmissions).toHaveBeenCalledTimes(1);
        expect(result).toEqual(admissions);
    });
});
