import { prisma } from '../../../infrastructure/db/prisma';
import { RoomStatus, RoomType } from '../../rooms/domain/room.entity';
import {
    AdmissionEntity,
    AdmissionPatientEntity,
    AdmissionRoomDepartmentEntity,
    AdmissionRoomEntity,
    AdmissionStatus,
} from '../domain/admission.entity';
import {
    AdmissionRepository,
    CreateAdmissionData,
    FindAdmissionsParams,
    UpdateAdmissionData,
} from '../domain/admission.repository';

const admissionInclude = {
    patient: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
        },
    },
    room: {
        include: {
            department: {
                select: {
                    id: true,
                    name: true,
                    location: true,
                },
            },
        },
    },
} as const;

function toAdmissionEntity(admission: {
    id: string;
    patientId: string;
    roomId: string;
    admissionDate: Date;
    dischargeDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    patient: AdmissionPatientEntity;
    room: {
        id: string;
        roomNumber: string;
        departmentId: string;
        type: string;
        status: string;
        capacity: number;
        department: AdmissionRoomDepartmentEntity;
    };
}): AdmissionEntity {
    return {
        ...admission,
        status: admission.status as AdmissionStatus,
        room: {
            ...admission.room,
            type: admission.room.type as RoomType,
            status: admission.room.status as RoomStatus,
        },
    };
}

function toRoomEntity(room: {
    id: string;
    roomNumber: string;
    departmentId: string;
    type: string;
    status: string;
    capacity: number;
    department: AdmissionRoomDepartmentEntity;
}): AdmissionRoomEntity {
    return {
        ...room,
        type: room.type as RoomType,
        status: room.status as RoomStatus,
    };
}

export class AdmissionPrismaRepository implements AdmissionRepository {
    async create(data: CreateAdmissionData): Promise<AdmissionEntity> {
        const admission = await prisma.admission.create({
            data,
            include: admissionInclude,
        });

        return toAdmissionEntity(admission);
    }

    async findMany(params: FindAdmissionsParams): Promise<AdmissionEntity[]> {
        const admissions = await prisma.admission.findMany({
            where: {
                ...(params.status ? { status: params.status } : {}),
                ...(params.patientId ? { patientId: params.patientId } : {}),
                ...(params.roomId ? { roomId: params.roomId } : {}),
            },
            include: admissionInclude,
            orderBy: {
                admissionDate: 'desc',
            },
        });

        return admissions.map(toAdmissionEntity);
    }

    async findById(id: string): Promise<AdmissionEntity | null> {
        const admission = await prisma.admission.findUnique({
            where: { id },
            include: admissionInclude,
        });

        return admission ? toAdmissionEntity(admission) : null;
    }

    async findPatientById(patientId: string): Promise<{ id: string } | null> {
        return prisma.patient.findFirst({
            where: {
                id: patientId,
                isDeleted: false,
            },
            select: {
                id: true,
            },
        });
    }

    async findRoomById(roomId: string): Promise<AdmissionRoomEntity | null> {
        const room = await prisma.room.findUnique({
            where: { id: roomId },
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

        return room ? toRoomEntity(room) : null;
    }

    async findActiveByPatientId(patientId: string): Promise<AdmissionEntity | null> {
        const admission = await prisma.admission.findFirst({
            where: {
                patientId,
                status: 'ACTIVE',
            },
            include: admissionInclude,
            orderBy: {
                admissionDate: 'desc',
            },
        });

        return admission ? toAdmissionEntity(admission) : null;
    }

    async countActiveAdmissionsByRoomId(roomId: string): Promise<number> {
        return prisma.admission.count({
            where: {
                roomId,
                status: 'ACTIVE',
            },
        });
    }

    async update(
        id: string,
        data: UpdateAdmissionData,
    ): Promise<AdmissionEntity> {
        const admission = await prisma.admission.update({
            where: { id },
            data,
            include: admissionInclude,
        });

        return toAdmissionEntity(admission);
    }

    async updateRoomStatus(roomId: string, status: RoomStatus): Promise<void> {
        await prisma.room.update({
            where: { id: roomId },
            data: {
                status,
            },
        });
    }
}
