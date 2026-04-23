import { prisma } from '../../../infrastructure/db/prisma';
import {
    CreatePatientData,
    FindPatientsParams,
    FindPatientsResult,
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

    async findMany(params: FindPatientsParams): Promise<FindPatientsResult> {
        const search = params.search?.trim();
        const where = {
            isDeleted: false,
            ...(search
                ? {
                    OR: [
                        {
                            firstName: {
                                contains: search,
                                mode: 'insensitive' as const,
                            },
                        },
                        {
                            lastName: {
                                contains: search,
                                mode: 'insensitive' as const,
                            },
                        },
                    ],
                }
                : {}),
        };

        const items = await prisma.patient.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            skip: (params.page - 1) * params.limit,
            take: params.limit,
        });

        const total = await prisma.patient.count({
            where,
        });

        return {
            items,
            total,
        };
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
