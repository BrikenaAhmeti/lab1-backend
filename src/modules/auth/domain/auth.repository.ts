import {
    RefreshToken,
    Role,
    User,
    UserClaim,
    UserRole,
    UserToken,
} from '../../../generated/prisma';

export interface UserRoleWithRole extends UserRole {
    role: Role;
}

export interface UserWithRoles extends User {
    userRoles: UserRoleWithRole[];
}

export interface CreateUserData {
    firstName: string;
    lastName: string;
    email: string;
    normalizedEmail: string;
    username: string;
    normalizedUsername: string;
    passwordHash: string;
    phoneNumber?: string;
    emailConfirmed?: boolean;
    lockoutEnabled?: boolean;
    accessFailedCount?: number;
    isActive?: boolean;
}

export interface UpdateUserData {
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
    accessFailedCount?: number;
    isActive?: boolean;
}

export interface CreateRoleData {
    name: string;
    normalizedName: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateRoleData {
    name?: string;
    normalizedName?: string;
    description?: string | null;
    isActive?: boolean;
}

export interface CreateUserClaimData {
    userId: string;
    claimType: string;
    claimValue: string;
}

export interface CreateOrUpdateUserTokenData {
    userId: string;
    loginProvider: string;
    tokenName: string;
    tokenValue: string;
}

export interface CreateRefreshTokenData {
    userId: string;
    token: string;
    expires: Date;
}

export interface AuthRepository {
    createUser(data: CreateUserData): Promise<User>;
    updateUser(id: string, data: UpdateUserData): Promise<User>;
    deleteUser(id: string): Promise<void>;
    findUserById(id: string): Promise<UserWithRoles | null>;
    findUserByEmail(email: string): Promise<UserWithRoles | null>;
    findUserByNormalizedEmail(normalizedEmail: string): Promise<UserWithRoles | null>;
    findUserByNormalizedUsername(normalizedUsername: string): Promise<UserWithRoles | null>;
    listUsers(): Promise<UserWithRoles[]>;
    setUserStatus(id: string, isActive: boolean): Promise<User>;
    incrementAccessFailedCount(id: string): Promise<User>;
    resetAccessFailedCount(id: string): Promise<User>;

    createRole(data: CreateRoleData): Promise<Role>;
    updateRole(id: string, data: UpdateRoleData): Promise<Role>;
    deleteRole(id: string): Promise<void>;
    findRoleById(id: string): Promise<Role | null>;
    findRoleByNormalizedName(normalizedName: string): Promise<Role | null>;
    listRoles(): Promise<Role[]>;
    countRoleAssignments(roleId: string): Promise<number>;

    listUserRoles(userId: string): Promise<UserRoleWithRole[]>;
    assignRoleToUser(userId: string, roleId: string): Promise<UserRole>;
    removeRoleFromUser(userId: string, roleId: string): Promise<void>;
    removeAllUserRoles(userId: string): Promise<void>;

    createUserClaim(data: CreateUserClaimData): Promise<UserClaim>;
    listUserClaims(userId: string): Promise<UserClaim[]>;

    createOrUpdateUserToken(data: CreateOrUpdateUserTokenData): Promise<UserToken>;
    listUserTokens(userId: string): Promise<UserToken[]>;

    createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshToken>;
    findRefreshToken(token: string): Promise<RefreshToken | null>;
    revokeRefreshToken(
        token: string,
        revokedAt: Date,
        replacedByToken?: string,
    ): Promise<void>;
    revokeUserRefreshTokens(userId: string, revokedAt: Date): Promise<void>;
    removeExpiredRefreshTokens(now: Date): Promise<void>;
    listUserRefreshTokens(userId: string): Promise<RefreshToken[]>;
}
