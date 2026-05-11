import { AppError } from '../../../shared/core/errors/app-error';
import {
    PaginatedResponse,
    paginateItems,
    sortItems,
} from '../../../shared/core/pagination';
import { AppointmentEntity, AppointmentStatus } from '../domain/appointment.entity';
import {
    AppointmentRepository,
    UpdateAppointmentData,
} from '../domain/appointment.repository';
import {
    CreateAppointmentDto,
    GetAppointmentsQueryDto,
    UpdateAppointmentDto,
} from '../dto/appointment.dto';

const appointmentSortAccessors = {
    created_at: (appointment: AppointmentEntity) => appointment.createdAt,
    date: (appointment: AppointmentEntity) => appointment.appointmentDate,
    time: (appointment: AppointmentEntity) => appointment.appointmentTime,
    status: (appointment: AppointmentEntity) => appointment.status,
} as const;

export class AppointmentService {
    constructor(
        private readonly appointmentRepository: AppointmentRepository,
    ) { }

    async createAppointment(
        data: CreateAppointmentDto,
    ): Promise<AppointmentEntity> {
        const patientId = data.patientId.trim();
        const doctorId = data.doctorId.trim();
        const date = data.date;
        const time = data.time.trim();

        await this.ensurePatientExists(patientId);
        await this.ensureDoctorExists(doctorId);
        this.ensureAppointmentNotInPast(date, time);
        await this.ensureDoctorAvailability(doctorId, date, time);

        return this.appointmentRepository.create({
            patientId,
            doctorId,
            appointmentDate: this.toAppointmentDate(date),
            appointmentTime: time,
            status: 'Scheduled',
            notes: this.normalizeNotes(data.notes),
        });
    }

    async getAppointments(
        data: GetAppointmentsQueryDto,
    ): Promise<PaginatedResponse<AppointmentEntity>> {
        const doctorId = data.doctorId?.trim();
        const patientId = data.patientId?.trim();

        if (doctorId) {
            await this.ensureDoctorExists(doctorId);
        }

        if (patientId) {
            await this.ensurePatientExists(patientId);
        }

        const appointments = await this.appointmentRepository.findMany({
            appointmentDate: data.date
                ? this.toAppointmentDate(data.date)
                : undefined,
            doctorId,
            patientId,
            status: data.status,
        });

        const fromDate = data.from
            ? this.toAppointmentDate(data.from)
            : undefined;
        const toDate = data.to
            ? this.toAppointmentDate(data.to)
            : undefined;

        const filteredAppointments = appointments.filter((appointment) => {
            if (
                fromDate
                && appointment.appointmentDate.getTime() < fromDate.getTime()
            ) {
                return false;
            }

            if (
                toDate
                && appointment.appointmentDate.getTime() > toDate.getTime()
            ) {
                return false;
            }

            return true;
        });

        const sortedAppointments = sortItems(
            filteredAppointments,
            data.sortBy,
            data.order,
            appointmentSortAccessors,
        );

        return paginateItems(sortedAppointments, data.page, data.limit);
    }

    async getTodayAppointments(
        data: GetAppointmentsQueryDto,
    ): Promise<PaginatedResponse<AppointmentEntity>> {
        return this.getAppointments({
            ...data,
            date: this.getTodayDate(),
            from: undefined,
            to: undefined,
        });
    }

    async getAppointmentById(id: string): Promise<AppointmentEntity> {
        return this.ensureAppointmentExists(id);
    }

    async updateAppointment(
        id: string,
        data: UpdateAppointmentDto,
    ): Promise<AppointmentEntity> {
        const appointment = await this.ensureAppointmentExists(id);
        const isScheduleChange =
            data.patientId !== undefined
            || data.doctorId !== undefined
            || data.date !== undefined
            || data.time !== undefined;
        const nextStatus = (data.status ?? appointment.status) as AppointmentStatus;

        if (isScheduleChange && appointment.status !== 'Scheduled') {
            throw new AppError('Only scheduled appointments can be rescheduled', 400);
        }

        if (isScheduleChange && nextStatus !== 'Scheduled') {
            throw new AppError(
                'Rescheduling requires appointment status to remain Scheduled',
                400,
            );
        }

        if (data.status !== undefined) {
            this.ensureValidStatusTransition(
                appointment.status as AppointmentStatus,
                data.status,
            );
        }

        const patientId = data.patientId?.trim() ?? appointment.patientId;
        const doctorId = data.doctorId?.trim() ?? appointment.doctorId;
        const date = data.date ?? this.toDateString(appointment.appointmentDate);
        const time = data.time?.trim() ?? appointment.appointmentTime;

        if (data.patientId !== undefined) {
            await this.ensurePatientExists(patientId);
        }

        if (data.doctorId !== undefined) {
            await this.ensureDoctorExists(doctorId);
        }

        if (isScheduleChange) {
            this.ensureAppointmentNotInPast(date, time);
            await this.ensureDoctorAvailability(doctorId, date, time, id);
        }

        const updateData: UpdateAppointmentData = {
            ...(data.patientId !== undefined ? { patientId } : {}),
            ...(data.doctorId !== undefined ? { doctorId } : {}),
            ...(data.date !== undefined
                ? { appointmentDate: this.toAppointmentDate(date) }
                : {}),
            ...(data.time !== undefined
                ? { appointmentTime: time }
                : {}),
            ...(data.status !== undefined
                ? { status: data.status }
                : {}),
            ...(data.notes !== undefined
                ? { notes: this.normalizeNotes(data.notes) }
                : {}),
        };

        return this.appointmentRepository.update(id, updateData);
    }

    async cancelAppointment(id: string): Promise<void> {
        const appointment = await this.ensureAppointmentExists(id);

        if (appointment.status === 'Completed') {
            throw new AppError('Completed appointment cannot be cancelled', 400);
        }

        if (appointment.status === 'Cancelled') {
            return;
        }

        await this.appointmentRepository.update(id, {
            status: 'Cancelled',
        });
    }

    private async ensureAppointmentExists(id: string): Promise<AppointmentEntity> {
        const appointment = await this.appointmentRepository.findById(id);

        if (!appointment) {
            throw new AppError('Appointment not found', 404);
        }

        return appointment;
    }

    private async ensurePatientExists(patientId: string): Promise<void> {
        const patient = await this.appointmentRepository.findPatientById(
            patientId.trim(),
        );

        if (!patient) {
            throw new AppError('Patient not found', 404);
        }
    }

    private async ensureDoctorExists(doctorId: string): Promise<void> {
        const doctor = await this.appointmentRepository.findDoctorById(
            doctorId.trim(),
        );

        if (!doctor) {
            throw new AppError('Doctor not found', 404);
        }

        if (doctor.isActive === false) {
            throw new AppError('Doctor is inactive', 409);
        }
    }

    private async ensureDoctorAvailability(
        doctorId: string,
        date: string,
        time: string,
        excludeAppointmentId?: string,
    ): Promise<void> {
        const conflict = await this.appointmentRepository.findConflict({
            doctorId,
            appointmentDate: this.toAppointmentDate(date),
            appointmentTime: time,
            excludeAppointmentId,
        });

        if (conflict) {
            throw new AppError(
                'Doctor already has an appointment at this date and time',
                409,
            );
        }
    }

    private ensureAppointmentNotInPast(date: string, time: string): void {
        const appointmentDateTime = this.toAppointmentDateTime(date, time);

        if (appointmentDateTime.getTime() < Date.now()) {
            throw new AppError('Appointment date cannot be in the past', 400);
        }
    }

    private ensureValidStatusTransition(
        currentStatus: AppointmentStatus,
        nextStatus: AppointmentStatus,
    ): void {
        if (currentStatus === nextStatus) {
            return;
        }

        if (currentStatus !== 'Scheduled') {
            throw new AppError('Appointment status cannot be changed', 400);
        }

        if (nextStatus === 'Completed' || nextStatus === 'Cancelled') {
            return;
        }

        throw new AppError('Invalid appointment status transition', 400);
    }

    private toAppointmentDate(date: string): Date {
        return new Date(`${date}T00:00:00.000Z`);
    }

    private toAppointmentDateTime(date: string, time: string): Date {
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);

        return new Date(year, month - 1, day, hours, minutes, 0, 0);
    }

    private toDateString(date: Date): string {
        return date.toISOString().slice(0, 10);
    }

    private getTodayDate(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    private normalizeNotes(
        notes: string | null | undefined,
    ): string | null {
        if (notes === null) {
            return null;
        }

        const value = notes?.trim();

        if (!value) {
            return null;
        }

        return value;
    }
}
