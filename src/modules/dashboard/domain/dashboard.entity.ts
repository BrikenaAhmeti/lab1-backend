import { AdmissionEntity } from '../../admissions/domain/admission.entity';
import { AppointmentEntity } from '../../appointments/domain/appointment.entity';

export interface DashboardStatsEntity {
    appointmentsToday: number;
    availableRooms: number;
    admittedPatients: number;
    totalPatients: number;
    totalDoctors: number;
    pendingInvoicesAmount: number;
}

export type DashboardTodayAppointmentEntity = AppointmentEntity;

export type DashboardActiveAdmissionEntity = AdmissionEntity;
