import { AppError } from '../../../shared/core/errors/app-error';
import { PrescriptionEntity } from '../domain/prescription.entity';
import {
    PrescriptionRepository,
    UpdatePrescriptionData,
} from '../domain/prescription.repository';
import {
    CreatePrescriptionDto,
    GetPrescriptionsQueryDto,
    UpdatePrescriptionDto,
} from '../dto/prescription.dto';

export class PrescriptionService {
    constructor(
        private readonly prescriptionRepository: PrescriptionRepository,
    ) { }

    async createPrescription(
        data: CreatePrescriptionDto,
    ): Promise<PrescriptionEntity> {
        const medicalRecordId = data.medicalRecordId.trim();

        await this.ensureMedicalRecordExists(medicalRecordId);

        return this.prescriptionRepository.create({
            medicalRecordId,
            medicine: data.medicine.trim(),
            dosage: data.dosage.trim(),
            duration: data.duration.trim(),
            instructions: this.normalizeInstructions(data.instructions),
        });
    }

    async getPrescriptions(
        data: GetPrescriptionsQueryDto,
    ): Promise<PrescriptionEntity[]> {
        const medicalRecordId = data.medicalRecordId.trim();

        await this.ensureMedicalRecordExists(medicalRecordId);

        return this.prescriptionRepository.findManyByMedicalRecordId(
            medicalRecordId,
        );
    }

    async getPrescriptionById(id: string): Promise<PrescriptionEntity> {
        return this.ensurePrescriptionExists(id);
    }

    async updatePrescription(
        id: string,
        data: UpdatePrescriptionDto,
    ): Promise<PrescriptionEntity> {
        await this.ensurePrescriptionExists(id);

        if (data.medicalRecordId !== undefined) {
            await this.ensureMedicalRecordExists(data.medicalRecordId.trim());
        }

        const updateData: UpdatePrescriptionData = {
            ...(data.medicalRecordId !== undefined
                ? { medicalRecordId: data.medicalRecordId.trim() }
                : {}),
            ...(data.medicine !== undefined
                ? { medicine: data.medicine.trim() }
                : {}),
            ...(data.dosage !== undefined
                ? { dosage: data.dosage.trim() }
                : {}),
            ...(data.duration !== undefined
                ? { duration: data.duration.trim() }
                : {}),
            ...(data.instructions !== undefined
                ? {
                    instructions: this.normalizeInstructions(data.instructions),
                }
                : {}),
        };

        return this.prescriptionRepository.update(id, updateData);
    }

    async deletePrescription(id: string): Promise<void> {
        await this.ensurePrescriptionExists(id);
        await this.prescriptionRepository.delete(id);
    }

    private async ensurePrescriptionExists(
        id: string,
    ): Promise<PrescriptionEntity> {
        const prescription = await this.prescriptionRepository.findById(id);

        if (!prescription) {
            throw new AppError('Prescription not found', 404);
        }

        return prescription;
    }

    private async ensureMedicalRecordExists(medicalRecordId: string): Promise<void> {
        const medicalRecord = await this.prescriptionRepository.findMedicalRecordById(
            medicalRecordId,
        );

        if (!medicalRecord) {
            throw new AppError('Medical record not found', 404);
        }
    }

    private normalizeInstructions(
        instructions: string | null | undefined,
    ): string | null {
        if (instructions === null) {
            return null;
        }

        const value = instructions?.trim();

        if (!value) {
            return null;
        }

        return value;
    }
}
