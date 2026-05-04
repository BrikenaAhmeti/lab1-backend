import { prisma } from '../../../infrastructure/db/prisma';
import {
    CreateNurseData,
    NurseRepository,
    UpdateNurseData,
} from '../domain/nurse.repository';
import { NurseDepartmentEntity, NurseEntity } from '../domain/nurse.entity';

const nurseInclude = {
    department: {
        select: {
            id: true,
            name: true,
            location: true,
        },
    },
} as const;

type NurseRow = Omit<NurseEntity, 'shift'> & {
    shift: string;
};

function mapNurseEntity(nurse: NurseRow): NurseEntity {
    return {
        ...nurse,
        shift: nurse.shift as NurseEntity['shift'],
    };
}

export class NursePrismaRepository implements NurseRepository {
    async create(data: CreateNurseData): Promise<NurseEntity> {
        const nurse = await prisma.nurse.create({
            data,
            include: nurseInclude,
        });

        return mapNurseEntity(nurse);
    }

    async findMany(departmentId?: string): Promise<NurseEntity[]> {
        const nurses = await prisma.nurse.findMany({
            where: departmentId
                ? {
                    departmentId,
                }
                : undefined,
            include: nurseInclude,
            orderBy: [
                {
                    lastName: 'asc',
                },
                {
                    firstName: 'asc',
                },
            ],
        });

        return nurses.map(mapNurseEntity);
    }

    async findById(id: string): Promise<NurseEntity | null> {
        const nurse = await prisma.nurse.findUnique({
            where: { id },
            include: nurseInclude,
        });

        return nurse ? mapNurseEntity(nurse) : null;
    }

    async findDepartmentById(
        departmentId: string,
    ): Promise<NurseDepartmentEntity | null> {
        return prisma.department.findUnique({
            where: { id: departmentId },
            select: {
                id: true,
                name: true,
                location: true,
            },
        });
    }

    async update(id: string, data: UpdateNurseData): Promise<NurseEntity> {
        const nurse = await prisma.nurse.update({
            where: { id },
            data,
            include: nurseInclude,
        });

        return mapNurseEntity(nurse);
    }

    async delete(id: string): Promise<NurseEntity> {
        const nurse = await prisma.nurse.delete({
            where: { id },
            include: nurseInclude,
        });

        return mapNurseEntity(nurse);
    }
}
