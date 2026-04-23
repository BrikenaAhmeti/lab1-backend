import { AppError } from '../../../shared/core/errors/app-error';
import { PatientEntity, PatientListResponse } from '../domain/patient.entity';
import { PatientRepository, UpdatePatientData } from '../domain/patient.repository';
import { CreatePatientDto, UpdatePatientDto } from '../dto/patient.dto';

export class PatientService {
    constructor(private readonly patientRepository: PatientRepository) { }

    async createPatient(data: CreatePatientDto): Promise<PatientEntity> {
        return this.patientRepository.create({
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            dateOfBirth: new Date(`${data.dateOfBirth}T00:00:00.000Z`),
            gender: data.gender,
            phoneNumber: data.phoneNumber.trim(),
            address: data.address.trim(),
            bloodType: data.bloodType,
        });
    }

    async getPatient(id: string): Promise<PatientEntity> {
        const patient = await this.patientRepository.findById(id);

        if (!patient) {
            throw new AppError('Patient not found', 404);
        }

        return patient;
    }

    async getPatients(data: {
        page: number;
        limit: number;
        search?: string;
    }): Promise<PatientListResponse> {
        const result = await this.patientRepository.findMany({
            page: data.page,
            limit: data.limit,
            search: data.search?.trim(),
        });

        return {
            items: result.items,
            page: data.page,
            limit: data.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / data.limit) || 1,
        };
    }

    async updatePatient(
        id: string,
        data: UpdatePatientDto,
    ): Promise<PatientEntity> {
        await this.ensurePatientExists(id);

        const updateData: UpdatePatientData = {
            ...(data.firstName !== undefined
                ? { firstName: data.firstName.trim() }
                : {}),
            ...(data.lastName !== undefined
                ? { lastName: data.lastName.trim() }
                : {}),
            ...(data.dateOfBirth !== undefined
                ? { dateOfBirth: new Date(`${data.dateOfBirth}T00:00:00.000Z`) }
                : {}),
            ...(data.gender !== undefined
                ? { gender: data.gender }
                : {}),
            ...(data.phoneNumber !== undefined
                ? { phoneNumber: data.phoneNumber.trim() }
                : {}),
            ...(data.address !== undefined
                ? { address: data.address.trim() }
                : {}),
            ...(data.bloodType !== undefined
                ? { bloodType: data.bloodType }
                : {}),
        };

        return this.patientRepository.update(id, updateData);
    }

    async deletePatient(id: string): Promise<void> {
        await this.ensurePatientExists(id);
        await this.patientRepository.softDelete(id);
    }

    private async ensurePatientExists(id: string): Promise<void> {
        const patient = await this.patientRepository.findById(id);

        if (!patient) {
            throw new AppError('Patient not found', 404);
        }
    }
}
