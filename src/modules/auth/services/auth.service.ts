import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../../../config/env';
import { AppError } from '../../../shared/core/errors/app-error';
import { Role, User } from '../../../generated/prisma';
import { AuthRepository, UserRoleWithRole, UserWithRoles } from '../domain/auth.repository';

export interface AuthUserResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    phoneNumber: string | null;
    emailConfirmed: boolean;
    isActive: boolean;
    lockoutEnabled: boolean;
    accessFailedCount: number;
    roles: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponse {
    user: AuthUserResponse;
    accessToken: string;
    refreshToken: string;
}

export interface RegisterInput {
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    password: string;
    phoneNumber?: string;
}

export interface LoginInput {
    identifier: string;
    password: string;
}

export interface CreateUserInput {
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    password: string;
    phoneNumber?: string;
    emailConfirmed?: boolean;
    lockoutEnabled?: boolean;
    isActive?: boolean;
    roleIds?: string[];
}

export interface UpdateUserInput {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    password?: string;
    phoneNumber?: string | null;
    emailConfirmed?: boolean;
    lockoutEnabled?: boolean;
    isActive?: boolean;
    roleIds?: string[];
}

export interface CreateRoleInput {
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateRoleInput {
    name?: string;
    description?: string | null;
    isActive?: boolean;
}

export interface SeedAdminInput {
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    password: string;
    phoneNumber?: string;
}

interface RefreshTokenPayload extends jwt.JwtPayload {
    sub: string;
}

export class AuthService {
    constructor(private readonly repository: AuthRepository) { }

    async register(input: RegisterInput): Promise<AuthResponse> {
        await this.ensureBaseRoles();

        const normalizedEmail = this.normalizeEmail(input.email);
        const existingUser = await this.repository.findUserByNormalizedEmail(normalizedEmail);

        if (existingUser) {
            throw new AppError('Email already exists', 409);
        }

        const passwordHash = await bcrypt.hash(input.password, 10);
        const usernameData = await this.resolveUsernameForCreate(
            input.username,
            input.email,
        );

        const user = await this.repository.createUser({
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            email: input.email.trim().toLowerCase(),
            normalizedEmail,
            username: usernameData.username,
            normalizedUsername: usernameData.normalizedUsername,
            passwordHash,
            phoneNumber: input.phoneNumber?.trim(),
            emailConfirmed: false,
            lockoutEnabled: true,
            accessFailedCount: 0,
            isActive: true,
        });

        const userRole = await this.repository.findRoleByNormalizedName('USER');

        if (!userRole) {
            throw new AppError('Default role not found', 500);
        }

        await this.repository.assignRoleToUser(user.id, userRole.id);

        const createdUser = await this.getExistingUserById(user.id);

        return this.createSession(createdUser);
    }

    async login(input: LoginInput): Promise<AuthResponse> {
        const normalizedIdentifier = input.identifier.trim().toUpperCase();
        const user =
            await this.repository.findUserByNormalizedEmail(normalizedIdentifier)
            ?? await this.repository.findUserByNormalizedUsername(normalizedIdentifier);

        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        if (!user.isActive) {
            throw new AppError('User is inactive', 403);
        }

        if (this.isUserLocked(user)) {
            throw new AppError('Account is locked', 423);
        }

        const isPasswordCorrect = await bcrypt.compare(input.password, user.passwordHash);

        if (!isPasswordCorrect) {
            const updatedUser = await this.repository.incrementAccessFailedCount(user.id);

            if (this.isUserLocked(updatedUser)) {
                throw new AppError('Account is locked', 423);
            }

            throw new AppError('Invalid email or password', 401);
        }

        if (user.accessFailedCount > 0) {
            await this.repository.resetAccessFailedCount(user.id);
        }

        const existingUser = await this.getExistingUserById(user.id);

        return this.createSession(existingUser);
    }

    async refresh(refreshToken: string): Promise<AuthResponse> {
        const payload = this.verifyRefreshToken(refreshToken);
        const tokenInDatabase = await this.repository.findRefreshToken(refreshToken);

        if (!tokenInDatabase || tokenInDatabase.revoked) {
            throw new AppError('Invalid refresh token', 401);
        }

        if (tokenInDatabase.expires.getTime() <= Date.now()) {
            throw new AppError('Refresh token expired', 401);
        }

        if (tokenInDatabase.userId !== payload.sub) {
            throw new AppError('Invalid refresh token', 401);
        }

        const user = await this.getExistingUserById(tokenInDatabase.userId);

        if (!user.isActive) {
            throw new AppError('User is inactive', 403);
        }

        const newRefreshTokenData = this.generateRefreshToken(user.id);

        await this.repository.revokeRefreshToken(
            refreshToken,
            new Date(),
            newRefreshTokenData.token,
        );

        await this.repository.createRefreshToken({
            userId: user.id,
            token: newRefreshTokenData.token,
            expires: newRefreshTokenData.expires,
        });

        await this.repository.removeExpiredRefreshTokens(new Date());

        const accessToken = this.generateAccessToken(user);

        await this.repository.createOrUpdateUserToken({
            userId: user.id,
            loginProvider: 'JWT',
            tokenName: 'ACCESS_TOKEN',
            tokenValue: accessToken,
        });

        return {
            user: this.mapUser(user),
            accessToken,
            refreshToken: newRefreshTokenData.token,
        };
    }

    async logout(refreshToken: string): Promise<void> {
        const existingToken = await this.repository.findRefreshToken(refreshToken);

        if (!existingToken || existingToken.revoked) {
            return;
        }

        await this.repository.revokeRefreshToken(refreshToken, new Date());
    }

    async getCurrentUser(userId: string): Promise<AuthUserResponse> {
        const user = await this.getExistingUserById(userId);

        return this.mapUser(user);
    }

    async listUsers(): Promise<AuthUserResponse[]> {
        const users = await this.repository.listUsers();

        return users.map((user) => this.mapUser(user));
    }

    async getUserById(userId: string): Promise<AuthUserResponse> {
        const user = await this.getExistingUserById(userId);

        return this.mapUser(user);
    }

    async createUser(input: CreateUserInput): Promise<AuthUserResponse> {
        await this.ensureBaseRoles();

        const normalizedEmail = this.normalizeEmail(input.email);
        const existingUser = await this.repository.findUserByNormalizedEmail(normalizedEmail);

        if (existingUser) {
            throw new AppError('Email already exists', 409);
        }

        const passwordHash = await bcrypt.hash(input.password, 10);
        const usernameData = await this.resolveUsernameForCreate(
            input.username,
            input.email,
        );
        const roleIds = this.normalizeUniqueIds(input.roleIds);

        await this.ensureCanAssignAdminRole(undefined, roleIds);

        const user = await this.repository.createUser({
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            email: input.email.trim().toLowerCase(),
            normalizedEmail,
            username: usernameData.username,
            normalizedUsername: usernameData.normalizedUsername,
            passwordHash,
            phoneNumber: input.phoneNumber?.trim(),
            emailConfirmed: input.emailConfirmed ?? false,
            lockoutEnabled: input.lockoutEnabled ?? true,
            accessFailedCount: 0,
            isActive: input.isActive ?? true,
        });

        if (roleIds.length > 0) {
            await this.validateRoleIds(roleIds);

            for (const roleId of roleIds) {
                await this.repository.assignRoleToUser(user.id, roleId);
            }
        } else {
            const userRole = await this.repository.findRoleByNormalizedName('USER');

            if (userRole) {
                await this.repository.assignRoleToUser(user.id, userRole.id);
            }
        }

        const createdUser = await this.getExistingUserById(user.id);

        return this.mapUser(createdUser);
    }

    async updateUser(userId: string, input: UpdateUserInput): Promise<AuthUserResponse> {
        const existingUser = await this.getExistingUserById(userId);
        const dataToUpdate: {
            firstName?: string;
            lastName?: string;
            email?: string;
            normalizedEmail?: string;
            username?: string;
            normalizedUsername?: string;
            passwordHash?: string;
            phoneNumber?: string | null;
            emailConfirmed?: boolean;
            lockoutEnabled?: boolean;
            isActive?: boolean;
        } = {};

        if (input.firstName !== undefined) {
            dataToUpdate.firstName = input.firstName.trim();
        }

        if (input.lastName !== undefined) {
            dataToUpdate.lastName = input.lastName.trim();
        }

        if (input.email !== undefined) {
            const normalizedEmail = this.normalizeEmail(input.email);

            if (normalizedEmail !== existingUser.normalizedEmail) {
                const userWithSameEmail =
                    await this.repository.findUserByNormalizedEmail(normalizedEmail);

                if (userWithSameEmail) {
                    throw new AppError('Email already exists', 409);
                }
            }

            dataToUpdate.email = input.email.trim().toLowerCase();
            dataToUpdate.normalizedEmail = normalizedEmail;
        }

        if (input.username !== undefined) {
            const usernameData = this.normalizeUsername(input.username);

            if (usernameData.normalizedUsername !== existingUser.normalizedUsername) {
                const userWithSameUsername = await this.repository.findUserByNormalizedUsername(
                    usernameData.normalizedUsername,
                );

                if (userWithSameUsername) {
                    throw new AppError('Username already exists', 409);
                }
            }

            dataToUpdate.username = usernameData.username;
            dataToUpdate.normalizedUsername = usernameData.normalizedUsername;
        }

        if (input.password !== undefined) {
            dataToUpdate.passwordHash = await bcrypt.hash(input.password, 10);
        }

        if (input.phoneNumber !== undefined) {
            dataToUpdate.phoneNumber = input.phoneNumber ? input.phoneNumber.trim() : null;
        }

        if (input.emailConfirmed !== undefined) {
            dataToUpdate.emailConfirmed = input.emailConfirmed;
        }

        if (input.lockoutEnabled !== undefined) {
            dataToUpdate.lockoutEnabled = input.lockoutEnabled;
        }

        if (input.isActive !== undefined) {
            dataToUpdate.isActive = input.isActive;
        }

        await this.repository.updateUser(userId, dataToUpdate);

        if (input.roleIds !== undefined) {
            await this.ensureCanAssignAdminRole(userId, input.roleIds);
            await this.replaceUserRoles(userId, input.roleIds);
        }

        const updatedUser = await this.getExistingUserById(userId);

        return this.mapUser(updatedUser);
    }

    async deleteUser(userId: string): Promise<void> {
        await this.getExistingUserById(userId);
        await this.repository.deleteUser(userId);
    }

    async setUserStatus(userId: string, isActive: boolean): Promise<AuthUserResponse> {
        await this.getExistingUserById(userId);
        await this.repository.setUserStatus(userId, isActive);

        const updatedUser = await this.getExistingUserById(userId);

        return this.mapUser(updatedUser);
    }

    async listRoles(): Promise<Role[]> {
        return this.repository.listRoles();
    }

    async createRole(input: CreateRoleInput): Promise<Role> {
        const normalizedName = this.normalizeRoleName(input.name);

        const existingRole = await this.repository.findRoleByNormalizedName(normalizedName);

        if (existingRole) {
            throw new AppError('Role already exists', 409);
        }

        return this.repository.createRole({
            name: input.name.trim(),
            normalizedName,
            description: input.description?.trim(),
            isActive: input.isActive ?? true,
        });
    }

    async updateRole(roleId: string, input: UpdateRoleInput): Promise<Role> {
        const existingRole = await this.repository.findRoleById(roleId);

        if (!existingRole) {
            throw new AppError('Role not found', 404);
        }

        const dataToUpdate: {
            name?: string;
            normalizedName?: string;
            description?: string | null;
            isActive?: boolean;
        } = {};

        if (input.name !== undefined) {
            const normalizedName = this.normalizeRoleName(input.name);

            if (normalizedName !== existingRole.normalizedName) {
                const roleWithSameName =
                    await this.repository.findRoleByNormalizedName(normalizedName);

                if (roleWithSameName) {
                    throw new AppError('Role already exists', 409);
                }
            }

            dataToUpdate.name = input.name.trim();
            dataToUpdate.normalizedName = normalizedName;
        }

        if (input.description !== undefined) {
            dataToUpdate.description = input.description ? input.description.trim() : null;
        }

        if (input.isActive !== undefined) {
            dataToUpdate.isActive = input.isActive;
        }

        return this.repository.updateRole(roleId, dataToUpdate);
    }

    async deleteRole(roleId: string): Promise<void> {
        const existingRole = await this.repository.findRoleById(roleId);

        if (!existingRole) {
            throw new AppError('Role not found', 404);
        }

        const assignmentCount = await this.repository.countRoleAssignments(roleId);

        if (assignmentCount > 0) {
            throw new AppError('Role is assigned to users and cannot be deleted', 409);
        }

        await this.repository.deleteRole(roleId);
    }

    async listUserRoles(userId: string): Promise<UserRoleWithRole[]> {
        await this.getExistingUserById(userId);

        return this.repository.listUserRoles(userId);
    }

    async assignRoleToUser(userId: string, roleId: string): Promise<UserRoleWithRole[]> {
        await this.getExistingUserById(userId);
        await this.ensureCanAssignAdminRole(userId, [roleId]);

        const role = await this.repository.findRoleById(roleId);

        if (!role) {
            throw new AppError('Role not found', 404);
        }

        const existingUserRoles = await this.repository.listUserRoles(userId);
        const alreadyAssigned = existingUserRoles.some((userRole) => userRole.roleId === roleId);

        if (alreadyAssigned) {
            throw new AppError('Role already assigned to user', 409);
        }

        await this.repository.assignRoleToUser(userId, roleId);

        return this.repository.listUserRoles(userId);
    }

    async removeRoleFromUser(userId: string, roleId: string): Promise<UserRoleWithRole[]> {
        await this.getExistingUserById(userId);
        await this.repository.removeRoleFromUser(userId, roleId);

        return this.repository.listUserRoles(userId);
    }

    async replaceUserRoles(userId: string, roleIds: string[]): Promise<UserRoleWithRole[]> {
        await this.getExistingUserById(userId);

        const normalizedRoleIds = this.normalizeUniqueIds(roleIds);
        await this.ensureCanAssignAdminRole(userId, normalizedRoleIds);

        await this.validateRoleIds(normalizedRoleIds);
        await this.repository.removeAllUserRoles(userId);

        for (const roleId of normalizedRoleIds) {
            await this.repository.assignRoleToUser(userId, roleId);
        }

        return this.repository.listUserRoles(userId);
    }

    async listUserRefreshTokens(userId: string) {
        await this.getExistingUserById(userId);

        return this.repository.listUserRefreshTokens(userId);
    }

    async revokeUserRefreshTokens(userId: string): Promise<void> {
        await this.getExistingUserById(userId);
        await this.repository.revokeUserRefreshTokens(userId, new Date());
    }

    async seedAdmin(input: SeedAdminInput): Promise<AuthUserResponse> {
        await this.ensureBaseRoles();

        const normalizedEmail = this.normalizeEmail(input.email);
        const usernameData = await this.resolveUsernameForSeed(input.username, input.email);
        const adminRole = await this.repository.findRoleByNormalizedName('ADMIN');

        if (!adminRole) {
            throw new AppError('Admin role not found', 500);
        }

        const passwordHash = await bcrypt.hash(input.password, 10);
        const userByEmail = await this.repository.findUserByNormalizedEmail(normalizedEmail);
        const userByUsername = await this.repository.findUserByNormalizedUsername(
            usernameData.normalizedUsername,
        );
        const existingUser = userByEmail ?? userByUsername;

        if (!existingUser) {
            const createdUser = await this.repository.createUser({
                firstName: input.firstName.trim(),
                lastName: input.lastName.trim(),
                email: input.email.trim().toLowerCase(),
                normalizedEmail,
                username: usernameData.username,
                normalizedUsername: usernameData.normalizedUsername,
                passwordHash,
                phoneNumber: input.phoneNumber?.trim(),
                emailConfirmed: true,
                lockoutEnabled: true,
                accessFailedCount: 0,
                isActive: true,
            });

            await this.repository.assignRoleToUser(createdUser.id, adminRole.id);
            await this.removeAdminRoleFromOtherUsers(createdUser.id);

            const user = await this.getExistingUserById(createdUser.id);

            return this.mapUser(user);
        }

        await this.repository.updateUser(existingUser.id, {
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            email: input.email.trim().toLowerCase(),
            normalizedEmail,
            username: usernameData.username,
            normalizedUsername: usernameData.normalizedUsername,
            passwordHash,
            phoneNumber: input.phoneNumber?.trim() ?? null,
            emailConfirmed: true,
            isActive: true,
        });

        const existingUserRoles = await this.repository.listUserRoles(existingUser.id);
        const hasAdminRole = existingUserRoles.some(
            (userRole) => userRole.roleId === adminRole.id,
        );

        if (!hasAdminRole) {
            await this.repository.assignRoleToUser(existingUser.id, adminRole.id);
        }

        await this.removeAdminRoleFromOtherUsers(existingUser.id);

        const user = await this.getExistingUserById(existingUser.id);

        return this.mapUser(user);
    }

    async ensureBaseRoles(): Promise<void> {
        const baseRoles: Array<{ name: string; normalizedName: string; description: string }> = [
            {
                name: 'Admin',
                normalizedName: 'ADMIN',
                description: 'Full access to the system',
            },
            {
                name: 'Manager',
                normalizedName: 'MANAGER',
                description: 'Manages core operations',
            },
            {
                name: 'User',
                normalizedName: 'USER',
                description: 'Limited access based on permissions',
            },
        ];

        for (const baseRole of baseRoles) {
            const existingRole = await this.repository.findRoleByNormalizedName(
                baseRole.normalizedName,
            );

            if (!existingRole) {
                await this.repository.createRole({
                    name: baseRole.name,
                    normalizedName: baseRole.normalizedName,
                    description: baseRole.description,
                    isActive: true,
                });
            }
        }
    }

    private async createSession(user: UserWithRoles): Promise<AuthResponse> {
        const accessToken = this.generateAccessToken(user);
        const refreshTokenData = this.generateRefreshToken(user.id);

        await this.repository.createRefreshToken({
            userId: user.id,
            token: refreshTokenData.token,
            expires: refreshTokenData.expires,
        });

        await this.repository.createOrUpdateUserToken({
            userId: user.id,
            loginProvider: 'JWT',
            tokenName: 'ACCESS_TOKEN',
            tokenValue: accessToken,
        });

        await this.repository.removeExpiredRefreshTokens(new Date());

        return {
            user: this.mapUser(user),
            accessToken,
            refreshToken: refreshTokenData.token,
        };
    }

    private generateAccessToken(user: UserWithRoles): string {
        const roles = user.userRoles.map((userRole) => userRole.role.normalizedName);

        return jwt.sign(
            {
                email: user.email,
                roles,
            },
            env.jwtAccessSecret,
            {
                subject: user.id,
                expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'],
            },
        );
    }

    private generateRefreshToken(userId: string): { token: string; expires: Date } {
        const token = jwt.sign({}, env.jwtRefreshSecret, {
            subject: userId,
            jwtid: randomUUID(),
            expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'],
        });

        const decodedToken = jwt.decode(token) as jwt.JwtPayload | null;

        if (!decodedToken || typeof decodedToken.exp !== 'number') {
            throw new AppError('Unable to generate refresh token', 500);
        }

        return {
            token,
            expires: new Date(decodedToken.exp * 1000),
        };
    }

    private verifyRefreshToken(token: string): RefreshTokenPayload {
        try {
            const payload = jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;

            if (!payload.sub) {
                throw new AppError('Invalid refresh token', 401);
            }

            return payload;
        } catch {
            throw new AppError('Invalid refresh token', 401);
        }
    }

    private mapUser(user: UserWithRoles): AuthUserResponse {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            phoneNumber: user.phoneNumber,
            emailConfirmed: user.emailConfirmed,
            isActive: user.isActive,
            lockoutEnabled: user.lockoutEnabled,
            accessFailedCount: user.accessFailedCount,
            roles: user.userRoles.map((userRole) => userRole.role.normalizedName),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    private normalizeEmail(email: string): string {
        return email.trim().toUpperCase();
    }

    private normalizeUsername(username: string): {
        username: string;
        normalizedUsername: string;
    } {
        const sanitized = username
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, '');

        if (sanitized.length < 3 || sanitized.length > 30) {
            throw new AppError('Username must be between 3 and 30 characters', 400);
        }

        return {
            username: sanitized,
            normalizedUsername: sanitized.toUpperCase(),
        };
    }

    private async resolveUsernameForCreate(
        username: string | undefined,
        email: string,
    ): Promise<{ username: string; normalizedUsername: string }> {
        if (username) {
            const usernameData = this.normalizeUsername(username);
            const existingUser = await this.repository.findUserByNormalizedUsername(
                usernameData.normalizedUsername,
            );

            if (existingUser) {
                throw new AppError('Username already exists', 409);
            }

            return usernameData;
        }

        return this.generateUniqueUsernameFromEmail(email);
    }

    private async resolveUsernameForSeed(
        username: string | undefined,
        email: string,
    ): Promise<{ username: string; normalizedUsername: string }> {
        if (username) {
            return this.normalizeUsername(username);
        }

        return this.generateUniqueUsernameFromEmail(email);
    }

    private async generateUniqueUsernameFromEmail(
        email: string,
    ): Promise<{ username: string; normalizedUsername: string }> {
        const baseFromEmail = this.usernameBaseFromEmail(email);
        let counter = 0;

        while (counter < 10000) {
            const candidate = counter === 0 ? baseFromEmail : `${baseFromEmail}${counter}`;
            const normalizedCandidate = candidate.toUpperCase();
            const existingUser =
                await this.repository.findUserByNormalizedUsername(normalizedCandidate);

            if (!existingUser) {
                return {
                    username: candidate,
                    normalizedUsername: normalizedCandidate,
                };
            }

            counter += 1;
        }

        throw new AppError('Unable to generate username', 500);
    }

    private usernameBaseFromEmail(email: string): string {
        const localPart = email.trim().toLowerCase().split('@')[0] ?? '';
        const sanitized = localPart.replace(/[^a-z0-9._-]/g, '');

        if (sanitized.length >= 3) {
            return sanitized.slice(0, 24);
        }

        return 'user';
    }

    private normalizeRoleName(roleName: string): string {
        return roleName.trim().toUpperCase();
    }

    private normalizeUniqueIds(ids: string[] | undefined): string[] {
        if (!ids || ids.length === 0) {
            return [];
        }

        return Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));
    }

    private async ensureCanAssignAdminRole(
        targetUserId: string | undefined,
        roleIds: string[],
    ): Promise<void> {
        const normalizedRoleIds = this.normalizeUniqueIds(roleIds);

        if (normalizedRoleIds.length === 0) {
            return;
        }

        const adminRole = await this.repository.findRoleByNormalizedName('ADMIN');

        if (!adminRole) {
            return;
        }

        if (!normalizedRoleIds.includes(adminRole.id)) {
            return;
        }

        const users = await this.repository.listUsers();
        const existingAdmin = users.find(
            (user) => user.id !== targetUserId && this.userHasRole(user, 'ADMIN'),
        );

        if (existingAdmin) {
            throw new AppError('Only one admin user is allowed', 409);
        }
    }

    private async removeAdminRoleFromOtherUsers(targetUserId: string): Promise<void> {
        const users = await this.repository.listUsers();

        for (const user of users) {
            if (user.id === targetUserId) {
                continue;
            }

            const adminAssignment = user.userRoles.find(
                (userRole) => userRole.role.normalizedName === 'ADMIN',
            );

            if (adminAssignment) {
                await this.repository.removeRoleFromUser(user.id, adminAssignment.roleId);
            }
        }
    }

    private userHasRole(user: UserWithRoles, normalizedRoleName: string): boolean {
        return user.userRoles.some(
            (userRole) => userRole.role.normalizedName === normalizedRoleName,
        );
    }

    private isUserLocked(user: User): boolean {
        return user.lockoutEnabled && user.accessFailedCount >= env.maxAccessFailedCount;
    }

    private async validateRoleIds(roleIds: string[]): Promise<void> {
        if (roleIds.length === 0) {
            return;
        }

        const roles = await this.repository.listRoles();
        const rolesById = new Set(roles.map((role) => role.id));

        for (const roleId of roleIds) {
            if (!rolesById.has(roleId)) {
                throw new AppError(`Role not found: ${roleId}`, 404);
            }
        }
    }

    private async getExistingUserById(userId: string): Promise<UserWithRoles> {
        const user = await this.repository.findUserById(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }
}
