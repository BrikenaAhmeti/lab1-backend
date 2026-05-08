import {
    DashboardActiveAdmissionEntity,
    DashboardStatsEntity,
    DashboardTodayAppointmentEntity,
} from './dashboard.entity';

export interface DashboardRepository {
    getStats(date: Date): Promise<DashboardStatsEntity>;
    getTodayAppointments(date: Date): Promise<DashboardTodayAppointmentEntity[]>;
    getActiveAdmissions(): Promise<DashboardActiveAdmissionEntity[]>;
}
