import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';
import { AuthRepository, UserRoleWithRole, UserWithRoles } from '../../src/modules/auth/domain/auth.repository';
import { AuthService } from '../../src/modules/auth/services/auth.service';
import { RefreshToken, Role, User, UserClaim, UserRole, UserToken } from '../../src/generated/prisma';
import { AppError } from '../../src/shared/core/errors/app-error';

function createRepositoryMock(): jest.Mocked<AuthRepository> {
    return {
        createUser: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
        findUserById: jest.fn(),
        findUserByEmail: jest.fn(),
        findUserByNormalizedEmail: jest.fn(),
        findUserByNormalizedUsername: jest.fn(),
        listUsers: jest.fn(),
        setUserStatus: jest.fn(),
        incrementAccessFailedCount: jest.fn(),
        resetAccessFailedCount: jest.fn(),
        createRole: jest.fn(),
        updateRole: jest.fn(),
        deleteRole: jest.fn(),
        findRoleById: jest.fn(),
        findRoleByNormalizedName: jest.fn(),
        listRoles: jest.fn(),
        countRoleAssignments: jest.fn(),
        listUserRoles: jest.fn(),
        assignRoleToUser: jest.fn(),
        removeRoleFromUser: jest.fn(),
        removeAllUserRoles: jest.fn(),
        createUserClaim: jest.fn(),
        listUserClaims: jest.fn(),
        createOrUpdateUserToken: jest.fn(),
        listUserTokens: jest.fn(),
        createRefreshToken: jest.fn(),
        findRefreshTokenByTokenId: jest.fn(),
        revokeRefreshToken: jest.fn(),
        revokeUserRefreshTokens: jest.fn(),
        removeExpiredRefreshTokens: jest.fn(),
        listUserRefreshTokens: jest.fn(),
    };
}

function createRole(overrides: Partial<Role> = {}): Role {
    return {
        id: overrides.id ?? 'role-user-id',
        name: overrides.name ?? 'User',
        description: overrides.description ?? 'Default user role',
        normalizedName: overrides.normalizedName ?? 'USER',
        isActive: overrides.isActive ?? true,
        createdAt: overrides.createdAt ?? new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-01-01T10:00:00.000Z'),
    };
}

function createUser(overrides: Partial<User> = {}): User {
    return {
        id: overrides.id ?? 'user-id-1',
        firstName: overrides.firstName ?? 'John',
        lastName: overrides.lastName ?? 'Doe',
        email: overrides.email ?? 'john@example.com',
        normalizedEmail: overrides.normalizedEmail ?? 'JOHN@EXAMPLE.COM',
        username: overrides.username ?? 'john',
        normalizedUsername: overrides.normalizedUsername ?? 'JOHN',
        passwordHash: overrides.passwordHash ?? '$2b$10$abcdefghijklmnopqrstuv',
        phoneNumber: overrides.phoneNumber ?? null,
        emailConfirmed: overrides.emailConfirmed ?? true,
        lockoutEnabled: overrides.lockoutEnabled ?? true,
        accessFailedCount: overrides.accessFailedCount ?? 0,
        isActive: overrides.isActive ?? true,
        createdAt: overrides.createdAt ?? new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-01-01T10:00:00.000Z'),
    };
}

function createUserRoleWithRole(
    userId: string,
    role: Role,
    overrides: Partial<UserRoleWithRole> = {},
): UserRoleWithRole {
    const baseUserRole: UserRole = {
        id: overrides.id ?? 'user-role-id-1',
        userId,
        roleId: role.id,
        createdAt: overrides.createdAt ?? new Date('2026-01-01T10:00:00.000Z'),
    };

    return {
        ...baseUserRole,
        role,
    };
}

function createUserWithRoles(
    user: User,
    userRoles: UserRoleWithRole[],
): UserWithRoles {
    return {
        ...user,
        userRoles,
    };
}

function createUserToken(overrides: Partial<UserToken> = {}): UserToken {
    return {
        id: overrides.id ?? 'user-token-id-1',
        userId: overrides.userId ?? 'user-id-1',
        loginProvider: overrides.loginProvider ?? 'JWT',
        tokenName: overrides.tokenName ?? 'ACCESS_TOKEN',
        tokenValue: overrides.tokenValue ?? 'token-value',
        createdAt: overrides.createdAt ?? new Date('2026-01-01T10:00:00.000Z'),
    };
}

function createRefreshToken(overrides: Partial<RefreshToken> = {}): RefreshToken {
    return {
        id: overrides.id ?? 'refresh-token-id-1',
        userId: overrides.userId ?? 'user-id-1',
        tokenId: overrides.tokenId ?? 'refresh-token-jti',
        tokenHash: overrides.tokenHash ?? '$2b$12$abcdefghijklmnopqrstuuuuuuuuuuuuuuuuuuuuuu',
        expires: overrides.expires ?? new Date(Date.now() + 60 * 60 * 1000),
        created: overrides.created ?? new Date('2026-01-01T10:00:00.000Z'),
        revoked: overrides.revoked ?? null,
        replacedByTokenId: overrides.replacedByTokenId ?? null,
    };
}

function createUserClaim(overrides: Partial<UserClaim> = {}): UserClaim {
    return {
        id: overrides.id ?? 'claim-id-1',
        userId: overrides.userId ?? 'user-id-1',
        claimType: overrides.claimType ?? 'permission',
        claimValue: overrides.claimValue ?? 'read',
        createdAt: overrides.createdAt ?? new Date('2026-01-01T10:00:00.000Z'),
    };
}

describe('AuthService', () => {
    const repository = createRepositoryMock();
    const service = new AuthService(repository);

    const adminRole = createRole({
        id: 'role-admin-id',
        name: 'Admin',
        normalizedName: 'ADMIN',
        description: 'Full access',
    });

    const receptionistRole = createRole({
        id: 'role-receptionist-id',
        name: 'Receptionist',
        normalizedName: 'RECEPTIONIST',
        description: 'Front desk access',
    });

    const nurseRole = createRole({
        id: 'role-nurse-id',
        name: 'Nurse',
        normalizedName: 'NURSE',
        description: 'Nurse access',
    });

    const userRole = createRole({
        id: 'role-user-id',
        name: 'User',
        normalizedName: 'USER',
        description: 'Standard user',
    });

    beforeEach(() => {
        jest.clearAllMocks();

        env.jwtAccessSecret = 'test-access-secret';
        env.jwtRefreshSecret = 'test-refresh-secret';
        env.jwtAccessExpiresIn = '15m';
        env.jwtRefreshExpiresIn = '7d';
        env.bcryptSaltRounds = 12;
        env.maxAccessFailedCount = 5;

        repository.listUsers.mockResolvedValue([]);
        repository.findUserByEmail.mockResolvedValue(null);
        repository.setUserStatus.mockResolvedValue(createUser());
        repository.deleteUser.mockResolvedValue();
        repository.updateUser.mockResolvedValue(createUser());
        repository.listRoles.mockResolvedValue([
            adminRole,
            receptionistRole,
            nurseRole,
            userRole,
        ]);
        repository.countRoleAssignments.mockResolvedValue(0);
        repository.findRoleById.mockResolvedValue(userRole);
        repository.updateRole.mockResolvedValue(userRole);
        repository.deleteRole.mockResolvedValue();
        repository.assignRoleToUser.mockResolvedValue({
            id: 'user-role-assigned-1',
            userId: 'user-id-1',
            roleId: userRole.id,
            createdAt: new Date('2026-01-01T10:00:00.000Z'),
        });
        repository.removeRoleFromUser.mockResolvedValue();
        repository.removeAllUserRoles.mockResolvedValue();
        repository.listUserRoles.mockResolvedValue([]);
        repository.createUserClaim.mockResolvedValue(createUserClaim());
        repository.listUserClaims.mockResolvedValue([]);
        repository.createOrUpdateUserToken.mockResolvedValue(createUserToken());
        repository.listUserTokens.mockResolvedValue([]);
        repository.revokeRefreshToken.mockResolvedValue();
        repository.revokeUserRefreshTokens.mockResolvedValue();
        repository.removeExpiredRefreshTokens.mockResolvedValue();
        repository.listUserRefreshTokens.mockResolvedValue([]);

        repository.findRoleByNormalizedName.mockImplementation(async (name) => {
            if (name === 'ADMIN') {
                return adminRole;
            }

            if (name === 'RECEPTIONIST') {
                return receptionistRole;
            }

            if (name === 'NURSE') {
                return nurseRole;
            }

            if (name === 'USER') {
                return userRole;
            }

            return null;
        });
        repository.findUserByNormalizedUsername.mockResolvedValue(null);
    });

    it('should register user and return hashed refresh token data', async () => {
        const passwordHash = await bcrypt.hash('password123', 10);
        const createdUser = createUser({
            id: 'new-user-id',
            firstName: 'Ana',
            lastName: 'Krasniqi',
            email: 'ana@example.com',
            normalizedEmail: 'ANA@EXAMPLE.COM',
            passwordHash,
        });
        const createdUserWithRoles = createUserWithRoles(createdUser, [
            createUserRoleWithRole(createdUser.id, userRole),
        ]);

        repository.findUserByNormalizedEmail.mockResolvedValueOnce(null);
        repository.createUser.mockResolvedValue(createdUser);
        repository.findUserById.mockResolvedValue(createdUserWithRoles);
        repository.createRefreshToken.mockImplementation(
            async ({ userId, tokenId, tokenHash, expires }) =>
                createRefreshToken({ userId, tokenId, tokenHash, expires }),
        );

        const result = await service.register({
            firstName: 'Ana',
            lastName: 'Krasniqi',
            email: 'ana@example.com',
            password: 'password123',
            phoneNumber: '044123123',
        });

        const createdUserData = repository.createUser.mock.calls[0][0];
        const createdRefreshToken = repository.createRefreshToken.mock.calls[0][0];

        expect(createdUserData).toEqual(
            expect.objectContaining({
                firstName: 'Ana',
                lastName: 'Krasniqi',
                email: 'ana@example.com',
                normalizedEmail: 'ANA@EXAMPLE.COM',
                username: 'ana',
                normalizedUsername: 'ANA',
            }),
        );
        expect(bcrypt.getRounds(createdUserData.passwordHash)).toBe(12);
        expect(repository.assignRoleToUser).toHaveBeenCalledWith('new-user-id', userRole.id);
        expect(createdRefreshToken.tokenId).toBeTruthy();
        expect(await bcrypt.compare(result.refreshToken, createdRefreshToken.tokenHash)).toBe(true);
        expect(result.user.email).toBe('ana@example.com');
        expect(result.user.roles).toEqual(['USER']);
        expect(result.accessToken).toBeTruthy();
        expect(result.refreshToken).toBeTruthy();
    });

    it('should login user and reset failed count when password is correct', async () => {
        const passwordHash = await bcrypt.hash('password123', 10);
        const existingUser = createUser({
            id: 'existing-user-id',
            email: 'staff@example.com',
            normalizedEmail: 'STAFF@EXAMPLE.COM',
            passwordHash,
            accessFailedCount: 2,
        });
        const existingUserWithRoles = createUserWithRoles(existingUser, [
            createUserRoleWithRole(existingUser.id, receptionistRole),
        ]);

        repository.findUserByNormalizedEmail.mockResolvedValue(existingUserWithRoles);
        repository.resetAccessFailedCount.mockResolvedValue({
            ...existingUser,
            accessFailedCount: 0,
        });
        repository.findUserById.mockResolvedValue(existingUserWithRoles);
        repository.createRefreshToken.mockImplementation(
            async ({ userId, tokenId, tokenHash, expires }) =>
                createRefreshToken({ userId, tokenId, tokenHash, expires }),
        );

        const result = await service.login({
            identifier: 'staff@example.com',
            password: 'password123',
        });

        expect(repository.resetAccessFailedCount).toHaveBeenCalledWith(existingUser.id);
        expect(result.user.roles).toEqual(['RECEPTIONIST']);
        expect(result.accessToken).toBeTruthy();
        expect(result.refreshToken).toBeTruthy();
    });

    it('should login with username when email is not provided', async () => {
        const passwordHash = await bcrypt.hash('password123', 10);
        const existingUser = createUser({
            id: 'username-login-user-id',
            email: 'doctor@example.com',
            normalizedEmail: 'DOCTOR@EXAMPLE.COM',
            username: 'doctor1',
            normalizedUsername: 'DOCTOR1',
            passwordHash,
            accessFailedCount: 0,
        });
        const existingUserWithRoles = createUserWithRoles(existingUser, [
            createUserRoleWithRole(existingUser.id, userRole),
        ]);

        repository.findUserByNormalizedEmail.mockResolvedValue(null);
        repository.findUserByNormalizedUsername.mockResolvedValue(existingUserWithRoles);
        repository.findUserById.mockResolvedValue(existingUserWithRoles);
        repository.createRefreshToken.mockImplementation(
            async ({ userId, tokenId, tokenHash, expires }) =>
                createRefreshToken({ userId, tokenId, tokenHash, expires }),
        );

        const result = await service.login({
            identifier: 'doctor1',
            password: 'password123',
        });

        expect(repository.findUserByNormalizedEmail).toHaveBeenCalledWith('DOCTOR1');
        expect(repository.findUserByNormalizedUsername).toHaveBeenCalledWith('DOCTOR1');
        expect(result.user.username).toBe('doctor1');
        expect(result.accessToken).toBeTruthy();
    });

    it('should reject login when email is not confirmed', async () => {
        const passwordHash = await bcrypt.hash('password123', 10);
        const existingUser = createUser({
            id: 'unconfirmed-user-id',
            email: 'unconfirmed@example.com',
            normalizedEmail: 'UNCONFIRMED@EXAMPLE.COM',
            passwordHash,
            emailConfirmed: false,
        });
        const existingUserWithRoles = createUserWithRoles(existingUser, [
            createUserRoleWithRole(existingUser.id, userRole),
        ]);

        repository.findUserByNormalizedEmail.mockResolvedValue(existingUserWithRoles);

        await expect(
            service.login({
                identifier: 'unconfirmed@example.com',
                password: 'password123',
            }),
        ).rejects.toMatchObject({
            message: 'Email confirmation is required',
            statusCode: 403,
        });
    });

    it('should increase failed count when password is wrong', async () => {
        const passwordHash = await bcrypt.hash('password123', 10);
        const existingUser = createUser({
            id: 'wrong-pass-user-id',
            email: 'wrong@example.com',
            normalizedEmail: 'WRONG@EXAMPLE.COM',
            passwordHash,
            accessFailedCount: 0,
        });
        const existingUserWithRoles = createUserWithRoles(existingUser, [
            createUserRoleWithRole(existingUser.id, userRole),
        ]);

        repository.findUserByNormalizedEmail.mockResolvedValue(existingUserWithRoles);
        repository.incrementAccessFailedCount.mockResolvedValue({
            ...existingUser,
            accessFailedCount: 1,
        });

        await expect(
            service.login({
                identifier: 'wrong@example.com',
                password: 'not-correct',
            }),
        ).rejects.toBeInstanceOf(AppError);

        expect(repository.incrementAccessFailedCount).toHaveBeenCalledWith(existingUser.id);
        expect(repository.resetAccessFailedCount).not.toHaveBeenCalled();
    });

    it('should not increase failed count for admin login failures', async () => {
        const passwordHash = await bcrypt.hash('password123', 10);
        const existingUser = createUser({
            id: 'admin-wrong-pass-user-id',
            email: 'admin@example.com',
            normalizedEmail: 'ADMIN@EXAMPLE.COM',
            passwordHash,
            accessFailedCount: env.maxAccessFailedCount,
        });
        const existingUserWithRoles = createUserWithRoles(existingUser, [
            createUserRoleWithRole(existingUser.id, adminRole),
        ]);

        repository.findUserByNormalizedEmail.mockResolvedValue(existingUserWithRoles);

        await expect(
            service.login({
                identifier: 'admin@example.com',
                password: 'not-correct',
            }),
        ).rejects.toBeInstanceOf(AppError);

        expect(repository.incrementAccessFailedCount).not.toHaveBeenCalled();
        expect(repository.resetAccessFailedCount).not.toHaveBeenCalled();
    });

    it('should rotate refresh token and return new session data', async () => {
        const passwordHash = await bcrypt.hash('password123', 10);
        const existingUser = createUser({
            id: 'refresh-user-id',
            email: 'refresh@example.com',
            normalizedEmail: 'REFRESH@EXAMPLE.COM',
            passwordHash,
        });
        const existingUserWithRoles = createUserWithRoles(existingUser, [
            createUserRoleWithRole(existingUser.id, adminRole),
        ]);

        const oldRefreshToken = jwt.sign({}, env.jwtRefreshSecret, {
            subject: existingUser.id,
            jwtid: 'old-refresh-token-id',
            expiresIn: '1h',
        });
        const oldRefreshTokenHash = await bcrypt.hash(
            oldRefreshToken,
            env.bcryptSaltRounds,
        );

        repository.findRefreshTokenByTokenId.mockResolvedValue(
            createRefreshToken({
                userId: existingUser.id,
                tokenId: 'old-refresh-token-id',
                tokenHash: oldRefreshTokenHash,
                expires: new Date(Date.now() + 60 * 60 * 1000),
                revoked: null,
            }),
        );
        repository.findUserById.mockResolvedValue(existingUserWithRoles);
        repository.createRefreshToken.mockImplementation(
            async ({ userId, tokenId, tokenHash, expires }) =>
                createRefreshToken({ userId, tokenId, tokenHash, expires }),
        );

        const result = await service.refresh(oldRefreshToken);
        const createdRefreshToken = repository.createRefreshToken.mock.calls[0][0];

        expect(repository.findRefreshTokenByTokenId).toHaveBeenCalledWith('old-refresh-token-id');
        expect(repository.revokeRefreshToken).toHaveBeenCalled();
        expect(repository.revokeRefreshToken.mock.calls[0][0]).toBe('old-refresh-token-id');
        expect(repository.revokeRefreshToken.mock.calls[0][2]).toBe(createdRefreshToken.tokenId);
        expect(result.user.roles).toEqual(['ADMIN']);
        expect(result.accessToken).toBeTruthy();
        expect(result.refreshToken).toBeTruthy();
        expect(result.refreshToken).not.toBe(oldRefreshToken);
        expect(await bcrypt.compare(result.refreshToken, createdRefreshToken.tokenHash)).toBe(true);
    });

    it('should reject expired refresh tokens', async () => {
        const expiredRefreshToken = jwt.sign({}, env.jwtRefreshSecret, {
            subject: 'refresh-user-id',
            jwtid: 'expired-refresh-token-id',
            expiresIn: -1,
        });

        await expect(service.refresh(expiredRefreshToken)).rejects.toMatchObject({
            message: 'Invalid refresh token',
            statusCode: 401,
        });

        expect(repository.findRefreshTokenByTokenId).not.toHaveBeenCalled();
    });

    it('should throw when creating duplicate role', async () => {
        repository.findRoleByNormalizedName.mockImplementation(async (name) => {
            if (name === 'ADMIN') {
                return adminRole;
            }

            if (name === 'RECEPTIONIST') {
                return receptionistRole;
            }

            if (name === 'USER') {
                return userRole;
            }

            if (name === 'NURSE') {
                return nurseRole;
            }

            return null;
        });

        await expect(
            service.createRole({
                name: 'Nurse',
                description: 'Nurse role',
            }),
        ).rejects.toBeInstanceOf(AppError);

        expect(repository.createRole).not.toHaveBeenCalled();
    });

    it('should change the current user password and revoke refresh tokens', async () => {
        const passwordHash = await bcrypt.hash('old-password', 10);
        const existingUser = createUser({
            id: 'password-user-id',
            passwordHash,
        });
        const existingUserWithRoles = createUserWithRoles(existingUser, [
            createUserRoleWithRole(existingUser.id, userRole),
        ]);

        repository.findUserById.mockResolvedValue(existingUserWithRoles);

        await service.changePassword(
            'password-user-id',
            'old-password',
            'new-password-123',
        );

        expect(repository.updateUser).toHaveBeenCalledWith(
            'password-user-id',
            expect.objectContaining({
                accessFailedCount: 0,
                passwordHash: expect.any(String),
            }),
        );
        expect(repository.revokeUserRefreshTokens).toHaveBeenCalledWith(
            'password-user-id',
            expect.any(Date),
        );
    });

    it('should create a receptionist user with the receptionist role', async () => {
        const createdUser = createUser({
            id: 'receptionist-user-id',
            firstName: 'Lira',
            lastName: 'Gashi',
            email: 'lira@example.com',
            normalizedEmail: 'LIRA@EXAMPLE.COM',
            username: 'lira.gashi',
            normalizedUsername: 'LIRA.GASHI',
        });
        const createdUserWithRoles = createUserWithRoles(createdUser, [
            createUserRoleWithRole(createdUser.id, receptionistRole),
        ]);

        repository.findUserByNormalizedEmail.mockResolvedValue(null);
        repository.findUserByNormalizedUsername.mockResolvedValue(null);
        repository.createUser.mockResolvedValue(createdUser);
        repository.findUserById.mockResolvedValue(createdUserWithRoles);

        const result = await service.createReceptionist({
            firstName: 'Lira',
            lastName: 'Gashi',
            email: 'lira@example.com',
            username: 'lira.gashi',
            password: 'Reception123!',
            phoneNumber: '+38344111222',
        });

        expect(repository.createUser).toHaveBeenCalledWith(
            expect.objectContaining({
                firstName: 'Lira',
                lastName: 'Gashi',
                email: 'lira@example.com',
                normalizedEmail: 'LIRA@EXAMPLE.COM',
                username: 'lira.gashi',
                normalizedUsername: 'LIRA.GASHI',
                phoneNumber: '+38344111222',
            }),
        );
        expect(repository.assignRoleToUser).toHaveBeenCalledWith(
            'receptionist-user-id',
            receptionistRole.id,
        );
        expect(result.roles).toEqual(['RECEPTIONIST']);
    });

    it('should reject password change when current password is wrong', async () => {
        const passwordHash = await bcrypt.hash('old-password', 10);
        const existingUser = createUser({
            id: 'password-user-id',
            passwordHash,
        });
        const existingUserWithRoles = createUserWithRoles(existingUser, [
            createUserRoleWithRole(existingUser.id, userRole),
        ]);

        repository.findUserById.mockResolvedValue(existingUserWithRoles);

        await expect(
            service.changePassword(
                'password-user-id',
                'wrong-password',
                'new-password-123',
            ),
        ).rejects.toMatchObject({
            message: 'Current password is incorrect',
            statusCode: 401,
        });
    });

    it('should let admin set a user password and revoke refresh tokens', async () => {
        const existingUser = createUser({
            id: 'target-user-id',
        });
        const existingUserWithRoles = createUserWithRoles(existingUser, [
            createUserRoleWithRole(existingUser.id, userRole),
        ]);

        repository.findUserById.mockResolvedValue(existingUserWithRoles);

        await service.setUserPassword('target-user-id', 'Doctor123!');

        expect(repository.updateUser).toHaveBeenCalledWith(
            'target-user-id',
            expect.objectContaining({
                accessFailedCount: 0,
                passwordHash: expect.any(String),
            }),
        );
        expect(repository.revokeUserRefreshTokens).toHaveBeenCalledWith(
            'target-user-id',
            expect.any(Date),
        );
    });
});
