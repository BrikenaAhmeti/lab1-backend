import { AppError } from '../../../shared/core/errors/app-error';
import {
    PaginatedResponse,
    paginateItems,
    sortItems,
} from '../../../shared/core/pagination';
import { RoomStatus } from '../../rooms/domain/room.entity';
import { AdmissionEntity, AdmissionRoomEntity } from '../domain/admission.entity';
import {
    AdmissionRepository,
    CreateAdmissionData,
    FindAdmissionsParams,
    UpdateAdmissionData,
} from '../domain/admission.repository';
import {
    CreateAdmissionDto,
    DischargeAdmissionDto,
    GetAdmissionsQueryDto,
} from '../dto/admission.dto';

const admissionSortAccessors = {
    created_at: (admission: AdmissionEntity) => admission.createdAt,
    admission_date: (admission: AdmissionEntity) => admission.admissionDate,
    discharge_date: (admission: AdmissionEntity) => admission.dischargeDate,
} as const;

export class AdmissionService {
    constructor(
        private readonly admissionRepository: AdmissionRepository,
    ) { }

    async createAdmission(data: CreateAdmissionDto): Promise<AdmissionEntity> {
        const patientId = data.patientId.trim();
        const roomId = data.roomId.trim();

        await this.ensurePatientExists(patientId);

        const room = await this.ensureRoomExists(roomId);

        if (room.status === 'UNDER_MAINTENANCE') {
            throw new AppError('Room is under maintenance', 409);
        }

        const existingAdmission = await this.admissionRepository.findActiveByPatientId(
            patientId,
        );

        if (existingAdmission) {
            throw new AppError('Patient is already admitted', 409);
        }

        const activeAdmissionsCount = await this.admissionRepository.countActiveAdmissionsByRoomId(
            roomId,
        );

        if (activeAdmissionsCount >= room.capacity) {
            throw new AppError('Room has no available capacity', 409);
        }

        const createData: CreateAdmissionData = {
            patientId,
            roomId,
            admissionDate: data.admissionDate
                ? this.toDate(data.admissionDate)
                : new Date(),
            status: 'ACTIVE',
        };

        const admission = await this.admissionRepository.create(createData);

        await this.syncRoomStatus(roomId);

        return this.ensureAdmissionExists(admission.id);
    }

    async getAdmissions(
        data: GetAdmissionsQueryDto,
    ): Promise<PaginatedResponse<AdmissionEntity>> {
        const patientId = data.patientId?.trim();
        const roomId = data.roomId?.trim();

        if (patientId) {
            await this.ensurePatientExists(patientId);
        }

        if (roomId) {
            await this.ensureRoomExists(roomId);
        }

        const params: FindAdmissionsParams = {
            ...(data.status !== undefined ? { status: data.status } : {}),
            ...(patientId !== undefined ? { patientId } : {}),
            ...(roomId !== undefined ? { roomId } : {}),
        };

        const admissions = await this.admissionRepository.findMany(params);
        const sortedAdmissions = sortItems(
            admissions,
            data.sortBy,
            data.order,
            admissionSortAccessors,
        );

        return paginateItems(sortedAdmissions, data.page, data.limit);
    }

    async getActiveAdmissions(
        data: GetAdmissionsQueryDto,
    ): Promise<PaginatedResponse<AdmissionEntity>> {
        return this.getAdmissions({
            ...data,
            status: 'ACTIVE',
        });
    }

    async dischargeAdmission(
        id: string,
        data: DischargeAdmissionDto,
    ): Promise<AdmissionEntity> {
        const admission = await this.ensureAdmissionExists(id);

        if (admission.status === 'DISCHARGED') {
            throw new AppError('Admission is already discharged', 400);
        }

        const dischargeDate = data.dischargeDate
            ? this.toDate(data.dischargeDate)
            : new Date();

        if (dischargeDate.getTime() < admission.admissionDate.getTime()) {
            throw new AppError(
                'Discharge date cannot be before admission date',
                400,
            );
        }

        const updateData: UpdateAdmissionData = {
            dischargeDate,
            status: 'DISCHARGED',
        };

        await this.admissionRepository.update(id, updateData);
        await this.syncRoomStatus(admission.roomId);

        return this.ensureAdmissionExists(id);
    }

    private async ensureAdmissionExists(id: string): Promise<AdmissionEntity> {
        const admission = await this.admissionRepository.findById(id);

        if (!admission) {
            throw new AppError('Admission not found', 404);
        }

        return admission;
    }

    private async ensurePatientExists(patientId: string): Promise<void> {
        const patient = await this.admissionRepository.findPatientById(
            patientId,
        );

        if (!patient) {
            throw new AppError('Patient not found', 404);
        }
    }

    private async ensureRoomExists(roomId: string): Promise<AdmissionRoomEntity> {
        const room = await this.admissionRepository.findRoomById(roomId);

        if (!room) {
            throw new AppError('Room not found', 404);
        }

        return room;
    }

    private async syncRoomStatus(roomId: string): Promise<void> {
        const room = await this.ensureRoomExists(roomId);

        if (room.status === 'UNDER_MAINTENANCE') {
            return;
        }

        const activeAdmissionsCount = await this.admissionRepository.countActiveAdmissionsByRoomId(
            roomId,
        );
        const nextStatus: RoomStatus = activeAdmissionsCount >= room.capacity
            ? 'OCCUPIED'
            : 'AVAILABLE';

        if (room.status === nextStatus) {
            return;
        }

        await this.admissionRepository.updateRoomStatus(roomId, nextStatus);
    }

    private toDate(value: string): Date {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            throw new AppError('Invalid date value', 400);
        }

        return date;
    }
}
