import { prisma } from '../../../infrastructure/db/prisma';
import {
    AuthRepository,
    CreateOrUpdateUserTokenData,
    CreateRefreshTokenData,
    CreateRoleData,
    CreateUserClaimData,
    CreateUserData,
    UpdateRoleData,
    UpdateUserData,
    UserRoleWithRole,
    UserWithRoles,
} from '../domain/auth.repository';
import { RefreshToken, Role, User, UserClaim, UserRole, UserToken } from '../../../generated/prisma';

export class AuthPrismaRepository implements AuthRepository {
    async createUser(data: CreateUserData): Promise<User> {
        return prisma.user.create({
            data,
        });
    }

    async updateUser(id: string, data: UpdateUserData): Promise<User> {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    async deleteUser(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id },
        });
    }

    async findUserById(id: string): Promise<UserWithRoles | null> {
        return prisma.user.findUnique({
            where: { id },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }

    async findUserByEmail(email: string): Promise<UserWithRoles | null> {
        return prisma.user.findUnique({
            where: { email },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }

    async findUserByNormalizedEmail(normalizedEmail: string): Promise<UserWithRoles | null> {
        return prisma.user.findUnique({
            where: { normalizedEmail },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }

    async listUsers(): Promise<UserWithRoles[]> {
        return prisma.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }

    async setUserStatus(id: string, isActive: boolean): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: {
                isActive,
            },
        });
    }

    async incrementAccessFailedCount(id: string): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: {
                accessFailedCount: {
                    increment: 1,
                },
            },
        });
    }

    async resetAccessFailedCount(id: string): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: {
                accessFailedCount: 0,
            },
        });
    }

    async createRole(data: CreateRoleData): Promise<Role> {
        return prisma.role.create({
            data,
        });
    }

    async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
        return prisma.role.update({
            where: { id },
            data,
        });
    }

    async deleteRole(id: string): Promise<void> {
        await prisma.role.delete({
            where: { id },
        });
    }

    async findRoleById(id: string): Promise<Role | null> {
        return prisma.role.findUnique({
            where: { id },
        });
    }

    async findRoleByNormalizedName(normalizedName: string): Promise<Role | null> {
        return prisma.role.findUnique({
            where: { normalizedName },
        });
    }

    async listRoles(): Promise<Role[]> {
        return prisma.role.findMany({
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    async countRoleAssignments(roleId: string): Promise<number> {
        return prisma.userRole.count({
            where: { roleId },
        });
    }

    async listUserRoles(userId: string): Promise<UserRoleWithRole[]> {
        return prisma.userRole.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                role: true,
            },
        });
    }

    async assignRoleToUser(userId: string, roleId: string): Promise<UserRole> {
        return prisma.userRole.create({
            data: {
                userId,
                roleId,
            },
        });
    }

    async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
        await prisma.userRole.deleteMany({
            where: {
                userId,
                roleId,
            },
        });
    }

    async removeAllUserRoles(userId: string): Promise<void> {
        await prisma.userRole.deleteMany({
            where: {
                userId,
            },
        });
    }

    async createUserClaim(data: CreateUserClaimData): Promise<UserClaim> {
        return prisma.userClaim.create({
            data,
        });
    }

    async listUserClaims(userId: string): Promise<UserClaim[]> {
        return prisma.userClaim.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    async createOrUpdateUserToken(data: CreateOrUpdateUserTokenData): Promise<UserToken> {
        return prisma.userToken.upsert({
            where: {
                userId_loginProvider_tokenName: {
                    userId: data.userId,
                    loginProvider: data.loginProvider,
                    tokenName: data.tokenName,
                },
            },
            create: data,
            update: {
                tokenValue: data.tokenValue,
            },
        });
    }

    async listUserTokens(userId: string): Promise<UserToken[]> {
        return prisma.userToken.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    async createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshToken> {
        return prisma.refreshToken.create({
            data,
        });
    }

    async findRefreshToken(token: string): Promise<RefreshToken | null> {
        return prisma.refreshToken.findUnique({
            where: { token },
        });
    }

    async revokeRefreshToken(
        token: string,
        revokedAt: Date,
        replacedByToken?: string,
    ): Promise<void> {
        await prisma.refreshToken.updateMany({
            where: {
                token,
                revoked: null,
            },
            data: {
                revoked: revokedAt,
                replacedByToken,
            },
        });
    }

    async revokeUserRefreshTokens(userId: string, revokedAt: Date): Promise<void> {
        await prisma.refreshToken.updateMany({
            where: {
                userId,
                revoked: null,
            },
            data: {
                revoked: revokedAt,
            },
        });
    }

    async removeExpiredRefreshTokens(now: Date): Promise<void> {
        await prisma.refreshToken.deleteMany({
            where: {
                expires: {
                    lt: now,
                },
            },
        });
    }

    async listUserRefreshTokens(userId: string): Promise<RefreshToken[]> {
        return prisma.refreshToken.findMany({
            where: { userId },
            orderBy: {
                created: 'desc',
            },
        });
    }
}
