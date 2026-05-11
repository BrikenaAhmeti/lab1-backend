jest.mock('../../src/infrastructure/db/prisma', () => {
    return {
        prisma: {
            doctor: {
                findMany: jest.fn(),
                findFirst: jest.fn(),
                findUnique: jest.fn(),
            },
        },
    };
});

import { DoctorPrismaRepository } from '../../src/modules/doctors/infrastructure/doctor.prisma.repository';

const prismaMock = jest.requireMock('../../src/infrastructure/db/prisma') as {
    prisma: {
        doctor: {
            findMany: jest.Mock;
            findFirst: jest.Mock;
            findUnique: jest.Mock;
        };
    };
};

describe('DoctorPrismaRepository', () => {
    const repository = new DoctorPrismaRepository();

    beforeEach(() => {
        prismaMock.prisma.doctor.findMany.mockReset();
        prismaMock.prisma.doctor.findFirst.mockReset();
        prismaMock.prisma.doctor.findUnique.mockReset();
    });

    it('falls back to unfiltered doctor list when isActive column is missing', async () => {
        const expectedDoctors = [
            {
                id: 'doctor-1',
                firstName: 'Arben',
                lastName: 'Hoxha',
            },
        ];

        prismaMock.prisma.doctor.findMany
            .mockRejectedValueOnce({
                code: 'P2022',
                meta: {
                    column: 'Doctor.isActive',
                },
            })
            .mockResolvedValueOnce(expectedDoctors);

        const result = await repository.findMany();

        expect(result).toEqual(expectedDoctors);
        expect(prismaMock.prisma.doctor.findMany).toHaveBeenCalledTimes(2);
        expect(prismaMock.prisma.doctor.findMany).toHaveBeenNthCalledWith(2, {
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                    },
                },
            },
            orderBy: [
                {
                    lastName: 'asc',
                },
                {
                    firstName: 'asc',
                },
            ],
        });
    });

    it('falls back to findUnique by id when isActive column is missing', async () => {
        const expectedDoctor = {
            id: 'doctor-1',
            firstName: 'Arben',
            lastName: 'Hoxha',
        };

        prismaMock.prisma.doctor.findFirst.mockRejectedValueOnce({
            code: 'P2022',
            meta: {
                column: 'Doctor.isActive',
            },
        });
        prismaMock.prisma.doctor.findUnique.mockResolvedValueOnce(expectedDoctor);

        const result = await repository.findById('doctor-1');

        expect(result).toEqual(expectedDoctor);
        expect(prismaMock.prisma.doctor.findUnique).toHaveBeenCalledWith({
            where: {
                id: 'doctor-1',
            },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                    },
                },
            },
        });
    });
});
