import { prisma } from '../../../infrastructure/db/prisma';
import {
    CreatePatientData,
    PatientRepository,
    UpdatePatientData,
} from '../domain/patient.repository';
import { PatientEntity } from '../domain/patient.entity';

export class PatientPrismaRepository implements PatientRepository {
    async create(data: CreatePatientData): Promise<PatientEntity> {
        return prisma.patient.create({
            data,
        });
    }

    async findById(id: string): Promise<PatientEntity | null> {
        return prisma.patient.findFirst({
            where: {
                id,
                isDeleted: false,
            },
        });
    }

    async findMany(): Promise<PatientEntity[]> {
        return prisma.patient.findMany({
            where: {
                isDeleted: false,
            },
        });
    }

    async update(id: string, data: UpdatePatientData): Promise<PatientEntity> {
        return prisma.patient.update({
            where: { id },
            data,
        });
    }

    async softDelete(id: string): Promise<PatientEntity> {
        return prisma.patient.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });
    }
}
