import { AppError } from '../../../shared/core/errors/app-error';
import {
    paginateItems,
    sortItems,
} from '../../../shared/core/pagination';
import { PatientEntity, PatientListResponse } from '../domain/patient.entity';
import { PatientRepository, UpdatePatientData } from '../domain/patient.repository';
import {
    CreatePatientDto,
    GetPatientsQueryDto,
    UpdatePatientDto,
} from '../dto/patient.dto';

const patientSortAccessors = {
    created_at: (patient: PatientEntity) => patient.createdAt,
    first_name: (patient: PatientEntity) => patient.firstName,
    last_name: (patient: PatientEntity) => patient.lastName,
    date_of_birth: (patient: PatientEntity) => patient.dateOfBirth,
} as const;

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

    async getPatients(data: GetPatientsQueryDto): Promise<PatientListResponse> {
        const patients = await this.patientRepository.findMany();
        const normalizedSearch = data.search?.trim().toLowerCase();

        const filteredPatients = patients.filter((patient) => {
            if (data.bloodGroup && patient.bloodType !== data.bloodGroup) {
                return false;
            }

            if (data.gender && patient.gender !== data.gender) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();

            return fullName.includes(normalizedSearch);
        });

        const sortedPatients = sortItems(
            filteredPatients,
            data.sortBy,
            data.order,
            patientSortAccessors,
        );

        return paginateItems(sortedPatients, data.page, data.limit);
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
