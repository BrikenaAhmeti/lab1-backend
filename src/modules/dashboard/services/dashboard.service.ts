import {
    DashboardActiveAdmissionEntity,
    DashboardStatsEntity,
    DashboardTodayAppointmentEntity,
} from '../domain/dashboard.entity';
import { DashboardRepository } from '../domain/dashboard.repository';

export class DashboardService {
    constructor(private readonly dashboardRepository: DashboardRepository) { }

    async getStats(): Promise<DashboardStatsEntity> {
        return this.dashboardRepository.getStats(
            this.toDate(this.getTodayDate()),
        );
    }

    async getTodayAppointments(): Promise<DashboardTodayAppointmentEntity[]> {
        return this.dashboardRepository.getTodayAppointments(
            this.toDate(this.getTodayDate()),
        );
    }

    async getActiveAdmissions(): Promise<DashboardActiveAdmissionEntity[]> {
        return this.dashboardRepository.getActiveAdmissions();
    }

    private toDate(date: string): Date {
        return new Date(`${date}T00:00:00.000Z`);
    }

    private getTodayDate(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
}
