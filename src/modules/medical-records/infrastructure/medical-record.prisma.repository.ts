import { prisma } from '../../../infrastructure/db/prisma';
import {
    MedicalRecordEntity,
    MedicalRecordPrescriptionEntity,
    MedicalRecordReferenceEntity,
} from '../domain/medical-record.entity';
import {
    CreateMedicalRecordData,
    MedicalRecordRepository,
    UpdateMedicalRecordData,
} from '../domain/medical-record.repository';

const medicalRecordInclude = {
    patient: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
        },
    },
    doctor: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
        },
    },
} as const;

export class MedicalRecordPrismaRepository implements MedicalRecordRepository {
    async create(data: CreateMedicalRecordData): Promise<MedicalRecordEntity> {
        return prisma.medicalRecord.create({
            data,
            include: medicalRecordInclude,
        });
    }

    async findManyByPatientId(patientId: string): Promise<MedicalRecordEntity[]> {
        return prisma.medicalRecord.findMany({
            where: { patientId },
            include: medicalRecordInclude,
            orderBy: [
                {
                    recordDate: 'desc',
                },
                {
                    createdAt: 'desc',
                },
            ],
        });
    }

    async findById(id: string): Promise<MedicalRecordEntity | null> {
        return prisma.medicalRecord.findUnique({
            where: { id },
            include: medicalRecordInclude,
        });
    }

    async findPatientById(id: string): Promise<MedicalRecordReferenceEntity | null> {
        return prisma.patient.findFirst({
            where: {
                id,
                isDeleted: false,
            },
            select: {
                id: true,
            },
        });
    }

    async findDoctorById(id: string): Promise<MedicalRecordReferenceEntity | null> {
        return prisma.doctor.findUnique({
            where: { id },
            select: {
                id: true,
                isActive: true,
            },
        });
    }

    async findPrescriptionsByMedicalRecordId(
        medicalRecordId: string,
    ): Promise<MedicalRecordPrescriptionEntity[]> {
        return prisma.prescription.findMany({
            where: { medicalRecordId },
            orderBy: [
                {
                    createdAt: 'desc',
                },
            ],
        });
    }

    async update(
        id: string,
        data: UpdateMedicalRecordData,
    ): Promise<MedicalRecordEntity> {
        return prisma.medicalRecord.update({
            where: { id },
            data,
            include: medicalRecordInclude,
        });
    }

    async delete(id: string): Promise<MedicalRecordEntity> {
        return prisma.medicalRecord.delete({
            where: { id },
            include: medicalRecordInclude,
        });
    }
}
