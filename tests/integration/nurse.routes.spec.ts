import jwt from 'jsonwebtoken';
import request from 'supertest';
import { env } from '../../src/config/env';

jest.mock('../../src/infrastructure/db/prisma', () => {
    interface MockDepartment {
        id: string;
        name: string;
        location: string;
    }

    interface MockNurse {
        id: string;
        firstName: string;
        lastName: string;
        departmentId: string;
        shift: 'Morning' | 'Evening' | 'Night';
        createdAt: Date;
        updatedAt: Date;
    }

    const departmentStore: MockDepartment[] = [];
    const nurseStore: MockNurse[] = [];
    let departmentCount = 1;
    let nurseCount = 1;

    function buildNurseEntity(nurse: MockNurse) {
        const department = departmentStore.find(
            (item) => item.id === nurse.departmentId,
        );

        if (!department) {
            throw new Error('Department not found');
        }

        return {
            ...nurse,
            department: {
                id: department.id,
                name: department.name,
                location: department.location,
            },
        };
    }

    function sortNurses(items: MockNurse[]) {
        return [...items].sort((a, b) => {
            const lastNameResult = a.lastName.localeCompare(b.lastName);

            if (lastNameResult !== 0) {
                return lastNameResult;
            }

            return a.firstName.localeCompare(b.firstName);
        });
    }

    return {
        prisma: {
            department: {
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    return (
                        departmentStore.find((item) => item.id === where.id) ?? null
                    );
                }),
            },
            nurse: {
                create: jest.fn(async ({
                    data,
                }: {
                    data: Omit<MockNurse, 'id' | 'createdAt' | 'updatedAt'>;
                }) => {
                    const now = new Date();
                    const nurse: MockNurse = {
                        id: `nurse-${nurseCount}`,
                        ...data,
                        createdAt: now,
                        updatedAt: now,
                    };

                    nurseCount += 1;
                    nurseStore.push(nurse);

                    return buildNurseEntity(nurse);
                }),
                findMany: jest.fn(async ({
                    where,
                }: {
                    where?: { departmentId: string };
                } = {}) => {
                    const nurses = where?.departmentId
                        ? nurseStore.filter(
                            (item) => item.departmentId === where.departmentId,
                        )
                        : nurseStore;

                    return sortNurses(nurses).map(buildNurseEntity);
                }),
                findUnique: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const nurse = nurseStore.find((item) => item.id === where.id);

                    return nurse ? buildNurseEntity(nurse) : null;
                }),
                update: jest.fn(async ({
                    where,
                    data,
                }: {
                    where: { id: string };
                    data: Partial<MockNurse>;
                }) => {
                    const nurse = nurseStore.find((item) => item.id === where.id);

                    if (!nurse) {
                        throw new Error('Nurse not found');
                    }

                    Object.assign(nurse, data, {
                        updatedAt: new Date(),
                    });

                    return buildNurseEntity(nurse);
                }),
                delete: jest.fn(async ({
                    where,
                }: {
                    where: { id: string };
                }) => {
                    const index = nurseStore.findIndex((item) => item.id === where.id);

                    if (index === -1) {
                        throw new Error('Nurse not found');
                    }

                    const [nurse] = nurseStore.splice(index, 1);

                    return buildNurseEntity(nurse);
                }),
            },
        },
        __resetNurses: () => {
            departmentStore.length = 0;
            nurseStore.length = 0;
            departmentCount = 1;
            nurseCount = 1;
        },
        __seedDepartment: (name: string, location = 'Block A') => {
            const department: MockDepartment = {
                id: `department-${departmentCount}`,
                name,
                location,
            };

            departmentCount += 1;
            departmentStore.push(department);

            return department;
        },
    };
});

import { createApp } from '../../src/app';

const prismaMock = jest.requireMock('../../src/infrastructure/db/prisma') as {
    __resetNurses: () => void;
    __seedDepartment: (
        name: string,
        location?: string,
    ) => {
        id: string;
        name: string;
        location: string;
    };
};

function createAccessToken(roles: string[]) {
    return jwt.sign(
        {
            sub: 'user-1',
            email: 'user@example.com',
            roles,
        },
        env.jwtAccessSecret,
    );
}

describe('Nurse routes', () => {
    const app = createApp();

    beforeEach(() => {
        prismaMock.__resetNurses();
        env.jwtAccessSecret = 'test-access-secret';
    });

    it('should reject unauthenticated requests', async () => {
        const response = await request(app).get('/api/nurses');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    it('should reject nurse creation for non-admin users', async () => {
        const userToken = createAccessToken(['USER']);
        const department = prismaMock.__seedDepartment('Cardiology');

        const response = await request(app)
            .post('/api/nurses')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                firstName: 'Sara',
                lastName: 'Krasniqi',
                departmentId: department.id,
                shift: 'Morning',
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Forbidden');
    });

    it('should validate nurse payload', async () => {
        const adminToken = createAccessToken(['ADMIN']);
        const department = prismaMock.__seedDepartment('Cardiology');

        const response = await request(app)
            .post('/api/nurses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'Sara',
                lastName: 'Krasniqi',
                departmentId: department.id,
                shift: 'Late',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            'Shift must be Morning, Evening, or Night',
        );
    });

    it('should complete the nurse CRUD flow', async () => {
        const adminToken = createAccessToken(['ADMIN']);
        const userToken = createAccessToken(['USER']);
        const cardiology = prismaMock.__seedDepartment('Cardiology');
        const neurology = prismaMock.__seedDepartment('Neurology', 'Block B');

        const createResponse = await request(app)
            .post('/api/nurses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                firstName: 'Sara',
                lastName: 'Krasniqi',
                departmentId: cardiology.id,
                shift: 'Morning',
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.firstName).toBe('Sara');
        expect(createResponse.body.departmentId).toBe(cardiology.id);
        expect(createResponse.body.shift).toBe('Morning');

        const nurseId = createResponse.body.id as string;

        const listResponse = await request(app)
            .get('/api/nurses')
            .set('Authorization', `Bearer ${userToken}`);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body.data).toHaveLength(1);
        expect(listResponse.body.data[0].id).toBe(nurseId);

        const filterResponse = await request(app)
            .get(`/api/nurses?departmentId=${cardiology.id}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(filterResponse.status).toBe(200);
        expect(filterResponse.body.data).toHaveLength(1);
        expect(filterResponse.body.data[0].departmentId).toBe(cardiology.id);

        const getResponse = await request(app)
            .get(`/api/nurses/${nurseId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.id).toBe(nurseId);

        const updateResponse = await request(app)
            .put(`/api/nurses/${nurseId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                departmentId: neurology.id,
                shift: 'Night',
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.departmentId).toBe(neurology.id);
        expect(updateResponse.body.shift).toBe('Night');

        const filteredAfterUpdateResponse = await request(app)
            .get(`/api/nurses?departmentId=${neurology.id}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(filteredAfterUpdateResponse.status).toBe(200);
        expect(filteredAfterUpdateResponse.body.data).toHaveLength(1);
        expect(filteredAfterUpdateResponse.body.data[0].departmentId).toBe(
            neurology.id,
        );

        const deleteResponse = await request(app)
            .delete(`/api/nurses/${nurseId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(deleteResponse.status).toBe(204);

        const getDeletedResponse = await request(app)
            .get(`/api/nurses/${nurseId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(getDeletedResponse.status).toBe(404);
        expect(getDeletedResponse.body.message).toBe('Nurse not found');
    });
});
