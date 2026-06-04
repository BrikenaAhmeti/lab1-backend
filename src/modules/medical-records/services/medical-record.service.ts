import { AppError } from '../../../shared/core/errors/app-error';
import {
    PaginatedResponse,
    paginateItems,
    sortItems,
} from '../../../shared/core/pagination';
import {
    MedicalRecordEntity,
    MedicalRecordPrescriptionEntity,
} from '../domain/medical-record.entity';
import {
    MedicalRecordRepository,
    UpdateMedicalRecordData,
} from '../domain/medical-record.repository';
import {
    CreateMedicalRecordDto,
    GetMedicalRecordsQueryDto,
    UpdateMedicalRecordDto,
} from '../dto/medical-record.dto';

const medicalRecordSortAccessors = {
    created_at: (medicalRecord: MedicalRecordEntity) => medicalRecord.createdAt,
    date: (medicalRecord: MedicalRecordEntity) => medicalRecord.recordDate,
} as const;

export class MedicalRecordService {
    constructor(
        private readonly medicalRecordRepository: MedicalRecordRepository,
    ) { }

    async createMedicalRecord(
        data: CreateMedicalRecordDto,
    ): Promise<MedicalRecordEntity> {
        const patientId = data.patientId.trim();
        const doctorId = data.doctorId.trim();

        await this.ensurePatientExists(patientId);
        await this.ensureDoctorExists(doctorId);

        return this.medicalRecordRepository.create({
            patientId,
            doctorId,
            diagnosis: data.diagnosis.trim(),
            treatment: data.treatment.trim(),
            prescriptionsText: this.normalizePrescriptionsText(
                data.prescriptionsText,
            ),
            recordDate: this.toRecordDate(data.date),
        });
    }

    async getMedicalRecords(
        data: GetMedicalRecordsQueryDto,
    ): Promise<PaginatedResponse<MedicalRecordEntity>> {
        const patientId = data.patientId.trim();

        await this.ensurePatientExists(patientId);

        const medicalRecords = await this.medicalRecordRepository.findManyByPatientId(
            patientId,
        );
        const sortedMedicalRecords = sortItems(
            medicalRecords,
            data.sortBy,
            data.order,
            medicalRecordSortAccessors,
        );

        return paginateItems(sortedMedicalRecords, data.page, data.limit);
    }

    async getMedicalRecordById(id: string): Promise<MedicalRecordEntity> {
        return this.ensureMedicalRecordExists(id);
    }

    async updateMedicalRecord(
        id: string,
        data: UpdateMedicalRecordDto,
    ): Promise<MedicalRecordEntity> {
        await this.ensureMedicalRecordExists(id);

        if (data.patientId !== undefined) {
            await this.ensurePatientExists(data.patientId.trim());
        }

        if (data.doctorId !== undefined) {
            await this.ensureDoctorExists(data.doctorId.trim());
        }

        const updateData: UpdateMedicalRecordData = {
            ...(data.patientId !== undefined
                ? { patientId: data.patientId.trim() }
                : {}),
            ...(data.doctorId !== undefined
                ? { doctorId: data.doctorId.trim() }
                : {}),
            ...(data.diagnosis !== undefined
                ? { diagnosis: data.diagnosis.trim() }
                : {}),
            ...(data.treatment !== undefined
                ? { treatment: data.treatment.trim() }
                : {}),
            ...(data.prescriptionsText !== undefined
                ? {
                    prescriptionsText: this.normalizePrescriptionsText(
                        data.prescriptionsText,
                    ),
                }
                : {}),
            ...(data.date !== undefined
                ? { recordDate: this.toRecordDate(data.date) }
                : {}),
        };

        return this.medicalRecordRepository.update(id, updateData);
    }

    async deleteMedicalRecord(id: string): Promise<void> {
        await this.ensureMedicalRecordExists(id);
        await this.medicalRecordRepository.delete(id);
    }

    async getMedicalRecordPrescriptions(
        id: string,
    ): Promise<MedicalRecordPrescriptionEntity[]> {
        await this.ensureMedicalRecordExists(id);

        return this.medicalRecordRepository.findPrescriptionsByMedicalRecordId(
            id,
        );
    }

    private async ensureMedicalRecordExists(
        id: string,
    ): Promise<MedicalRecordEntity> {
        const medicalRecord = await this.medicalRecordRepository.findById(id);

        if (!medicalRecord) {
            throw new AppError('Medical record not found', 404);
        }

        return medicalRecord;
    }

    private async ensurePatientExists(patientId: string): Promise<void> {
        const patient = await this.medicalRecordRepository.findPatientById(
            patientId.trim(),
        );

        if (!patient) {
            throw new AppError('Patient not found', 404);
        }
    }

    private async ensureDoctorExists(doctorId: string): Promise<void> {
        const doctor = await this.medicalRecordRepository.findDoctorById(
            doctorId.trim(),
        );

        if (!doctor) {
            throw new AppError('Doctor not found', 404);
        }

        if (doctor.isActive === false) {
            throw new AppError('Doctor is inactive', 409);
        }
    }

    private toRecordDate(date: string): Date {
        return new Date(`${date}T00:00:00.000Z`);
    }

    private normalizePrescriptionsText(
        prescriptionsText: string | null | undefined,
    ): string | null {
        if (prescriptionsText === null) {
            return null;
        }

        const value = prescriptionsText?.trim();

        if (!value) {
            return null;
        }

        return value;
    }
}
