import { AppError } from '../../src/shared/core/errors/app-error';
import { CreateRoomCommand } from '../../src/modules/rooms/application/commands/create-room.command';
import { DeleteRoomCommand } from '../../src/modules/rooms/application/commands/delete-room.command';
import { UpdateRoomCommand } from '../../src/modules/rooms/application/commands/update-room.command';
import { CreateRoomHandler } from '../../src/modules/rooms/application/handlers/create-room.handler';
import { DeleteRoomHandler } from '../../src/modules/rooms/application/handlers/delete-room.handler';
import { GetAvailableRoomsHandler } from '../../src/modules/rooms/application/handlers/get-available-rooms.handler';
import { GetRoomByIdHandler } from '../../src/modules/rooms/application/handlers/get-room-by-id.handler';
import { GetRoomsHandler } from '../../src/modules/rooms/application/handlers/get-rooms.handler';
import { UpdateRoomHandler } from '../../src/modules/rooms/application/handlers/update-room.handler';
import {
    RoomCurrentAdmissionEntity,
    RoomDepartmentEntity,
    RoomStoredEntity,
} from '../../src/modules/rooms/domain/room.entity';
import { RoomRepository } from '../../src/modules/rooms/domain/room.repository';
import { GetAvailableRoomsQuery } from '../../src/modules/rooms/application/queries/get-available-rooms.query';
import { GetRoomByIdQuery } from '../../src/modules/rooms/application/queries/get-room-by-id.query';
import { GetRoomsQuery } from '../../src/modules/rooms/application/queries/get-rooms.query';
import { RoomService } from '../../src/modules/rooms/services/room.service';

function createDepartment(
    overrides: Partial<RoomDepartmentEntity> = {},
): RoomDepartmentEntity {
    return {
        id: overrides.id ?? 'department-1',
        name: overrides.name ?? 'Emergency',
        location: overrides.location ?? 'Block A',
    };
}

function createRoom(
    overrides: Partial<RoomStoredEntity> = {},
): RoomStoredEntity {
    return {
        id: overrides.id ?? 'room-1',
        roomNumber: overrides.roomNumber ?? '101A',
        departmentId: overrides.departmentId ?? 'department-1',
        type: overrides.type ?? 'GENERAL',
        status: overrides.status ?? 'AVAILABLE',
        capacity: overrides.capacity ?? 2,
        department: overrides.department ?? createDepartment(),
        createdAt: overrides.createdAt ?? new Date('2026-05-01T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-05-01T10:00:00.000Z'),
    };
}

function createCurrentAdmission(
    overrides: Partial<RoomCurrentAdmissionEntity> = {},
): RoomCurrentAdmissionEntity {
    return {
        id: overrides.id ?? 'admission-1',
        patientId: overrides.patientId ?? 'patient-1',
        roomId: overrides.roomId ?? 'room-1',
        admissionDate:
            overrides.admissionDate ?? new Date('2026-05-02T10:00:00.000Z'),
        dischargeDate: overrides.dischargeDate ?? null,
        status: overrides.status ?? 'ACTIVE',
        patient: overrides.patient ?? {
            id: 'patient-1',
            firstName: 'Ana',
            lastName: 'Berisha',
        },
    };
}

describe('Room handlers', () => {
    const repository: jest.Mocked<RoomRepository> = {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        findByRoomNumber: jest.fn(),
        findDepartmentById: jest.fn(),
        findActiveAdmissionsByRoomId: jest.fn(),
        countActiveAdmissionsByRoomIds: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a room when room number is unique', async () => {
        repository.findDepartmentById.mockResolvedValue(createDepartment());
        repository.findByRoomNumber.mockResolvedValue(null);
        repository.create.mockResolvedValue(createRoom({
            type: 'ICU',
        }));
        repository.countActiveAdmissionsByRoomIds.mockResolvedValue({
            'room-1': 0,
        });

        const service = new RoomService(repository);
        const handler = new CreateRoomHandler(service);
        const result = await handler.execute(
            new CreateRoomCommand({
                roomNumber: ' 101A ',
                departmentId: ' department-1 ',
                type: 'ICU',
                capacity: 2,
            }),
        );

        expect(repository.findDepartmentById).toHaveBeenCalledWith(
            'department-1',
        );
        expect(repository.findByRoomNumber).toHaveBeenCalledWith('101A');
        expect(repository.create).toHaveBeenCalledWith({
            roomNumber: '101A',
            departmentId: 'department-1',
            type: 'ICU',
            status: 'AVAILABLE',
            capacity: 2,
        });
        expect(result).toMatchObject({
            roomNumber: '101A',
            type: 'ICU',
            status: 'AVAILABLE',
            activeAdmissionsCount: 0,
            availableCapacity: 2,
        });
    });

    it('should reject room creation when room number already exists', async () => {
        repository.findDepartmentById.mockResolvedValue(createDepartment());
        repository.findByRoomNumber.mockResolvedValue(createRoom());

        const service = new RoomService(repository);
        const handler = new CreateRoomHandler(service);

        await expect(
            handler.execute(
                new CreateRoomCommand({
                    roomNumber: '101A',
                    departmentId: 'department-1',
                    type: 'GENERAL',
                    capacity: 2,
                }),
            ),
        ).rejects.toBeInstanceOf(AppError);

        expect(repository.create).not.toHaveBeenCalled();
    });

    it('should calculate room availability and auto-set full rooms to occupied', async () => {
        const rooms = [
            createRoom({
                id: 'room-1',
                roomNumber: '101A',
                capacity: 2,
            }),
            createRoom({
                id: 'room-2',
                roomNumber: '102A',
                type: 'ICU',
                capacity: 1,
            }),
            createRoom({
                id: 'room-3',
                roomNumber: '103A',
                status: 'UNDER_MAINTENANCE',
                capacity: 3,
            }),
        ];

        repository.findDepartmentById.mockResolvedValue(createDepartment());
        repository.findMany.mockResolvedValue(rooms);
        repository.countActiveAdmissionsByRoomIds.mockResolvedValue({
            'room-1': 1,
            'room-2': 1,
            'room-3': 0,
        });

        const service = new RoomService(repository);
        const getRoomsHandler = new GetRoomsHandler(service);
        const getAvailableRoomsHandler = new GetAvailableRoomsHandler(service);

        const allRooms = await getRoomsHandler.execute(
            new GetRoomsQuery({
                page: 1,
                limit: 10,
                sortBy: 'created_at',
                order: 'DESC',
                departmentId: 'department-1',
            }),
        );

        const availableRooms = await getAvailableRoomsHandler.execute(
            new GetAvailableRoomsQuery({
                page: 1,
                limit: 10,
                sortBy: 'created_at',
                order: 'DESC',
                departmentId: 'department-1',
            }),
        );

        expect(repository.findMany).toHaveBeenCalledWith({
            departmentId: 'department-1',
            type: undefined,
        });
        expect(allRooms.data.find((room) => room.id === 'room-2')).toMatchObject({
            status: 'OCCUPIED',
            activeAdmissionsCount: 1,
            availableCapacity: 0,
        });
        expect(availableRooms.data).toHaveLength(1);
        expect(availableRooms.data[0]).toMatchObject({
            id: 'room-1',
            status: 'AVAILABLE',
            activeAdmissionsCount: 1,
            availableCapacity: 1,
        });
    });

    it('should return room details with current admissions', async () => {
        repository.findById.mockResolvedValue(createRoom());
        repository.countActiveAdmissionsByRoomIds.mockResolvedValue({
            'room-1': 1,
        });
        repository.findActiveAdmissionsByRoomId.mockResolvedValue([
            createCurrentAdmission(),
        ]);

        const service = new RoomService(repository);
        const handler = new GetRoomByIdHandler(service);
        const result = await handler.execute(new GetRoomByIdQuery('room-1'));

        expect(repository.findActiveAdmissionsByRoomId).toHaveBeenCalledWith(
            'room-1',
        );
        expect(result).toMatchObject({
            id: 'room-1',
            activeAdmissionsCount: 1,
            availableCapacity: 1,
            currentAdmissions: [
                {
                    id: 'admission-1',
                    patientId: 'patient-1',
                    patient: {
                        firstName: 'Ana',
                        lastName: 'Berisha',
                    },
                },
            ],
        });
    });

    it('should reject room updates that lower capacity below active admissions', async () => {
        repository.findById.mockResolvedValue(createRoom({
            capacity: 3,
        }));
        repository.countActiveAdmissionsByRoomIds.mockResolvedValue({
            'room-1': 2,
        });

        const service = new RoomService(repository);
        const handler = new UpdateRoomHandler(service);

        await expect(
            handler.execute(
                new UpdateRoomCommand('room-1', {
                    capacity: 1,
                }),
            ),
        ).rejects.toMatchObject({
            message: 'Room capacity cannot be lower than active admissions count',
            statusCode: 400,
        });

        expect(repository.update).not.toHaveBeenCalled();
    });

    it('should reject room deletion while active admissions exist', async () => {
        repository.findById.mockResolvedValue(createRoom());
        repository.countActiveAdmissionsByRoomIds.mockResolvedValue({
            'room-1': 1,
        });

        const service = new RoomService(repository);
        const handler = new DeleteRoomHandler(service);

        await expect(
            handler.execute(new DeleteRoomCommand('room-1')),
        ).rejects.toMatchObject({
            message: 'Room cannot be deleted while it has active admissions',
            statusCode: 409,
        });

        expect(repository.delete).not.toHaveBeenCalled();
    });
});
