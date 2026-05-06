import { prisma } from '../../../infrastructure/db/prisma';
import {
    PrescriptionEntity,
    PrescriptionReferenceEntity,
} from '../domain/prescription.entity';
import {
    CreatePrescriptionData,
    PrescriptionRepository,
    UpdatePrescriptionData,
} from '../domain/prescription.repository';

export class PrescriptionPrismaRepository implements PrescriptionRepository {
    async create(data: CreatePrescriptionData): Promise<PrescriptionEntity> {
        return prisma.prescription.create({
            data,
        });
    }

    async findManyByMedicalRecordId(
        medicalRecordId: string,
    ): Promise<PrescriptionEntity[]> {
        return prisma.prescription.findMany({
            where: { medicalRecordId },
            orderBy: [
                {
                    createdAt: 'desc',
                },
            ],
        });
    }

    async findById(id: string): Promise<PrescriptionEntity | null> {
        return prisma.prescription.findUnique({
            where: { id },
        });
    }

    async findMedicalRecordById(
        id: string,
    ): Promise<PrescriptionReferenceEntity | null> {
        return prisma.medicalRecord.findUnique({
            where: { id },
            select: {
                id: true,
            },
        });
    }

    async update(
        id: string,
        data: UpdatePrescriptionData,
    ): Promise<PrescriptionEntity> {
        return prisma.prescription.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<PrescriptionEntity> {
        return prisma.prescription.delete({
            where: { id },
        });
    }
}
