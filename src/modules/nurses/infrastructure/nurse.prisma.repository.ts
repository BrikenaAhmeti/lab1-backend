import { prisma } from '../../../infrastructure/db/prisma';
import { Prisma } from '../../../generated/prisma';
import {
    CreateNurseData,
    NurseListFilters,
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
    user: {
        select: {
            id: true,
            email: true,
            username: true,
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

    async findMany(filters: NurseListFilters = {}): Promise<NurseEntity[]> {
        const search = filters.search?.trim();
        const searchFieldFilter = search
            ? {
                contains: search,
                mode: 'insensitive' as const,
            }
            : undefined;
        const where: Prisma.NurseWhereInput = {
            ...(filters.departmentId
                ? {
                    departmentId: filters.departmentId,
                }
                : {}),
            ...(filters.shift
                ? {
                    shift: filters.shift,
                }
                : {}),
            ...(searchFieldFilter
                ? {
                    OR: [
                        {
                            firstName: searchFieldFilter,
                        },
                        {
                            lastName: searchFieldFilter,
                        },
                        {
                            department: {
                                is: {
                                    name: searchFieldFilter,
                                },
                            },
                        },
                        {
                            department: {
                                is: {
                                    location: searchFieldFilter,
                                },
                            },
                        },
                        {
                            user: {
                                is: {
                                    email: searchFieldFilter,
                                },
                            },
                        },
                        {
                            user: {
                                is: {
                                    username: searchFieldFilter,
                                },
                            },
                        },
                    ],
                }
                : {}),
        };

        const nurses = await prisma.nurse.findMany({
            where,
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

    async findByUserId(userId: string): Promise<NurseEntity | null> {
        const nurse = await prisma.nurse.findUnique({
            where: { userId },
            include: nurseInclude,
        });

        return nurse ? mapNurseEntity(nurse) : null;
    }

    async findUserById(userId: string): Promise<{ id: string } | null> {
        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
            },
        });
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
