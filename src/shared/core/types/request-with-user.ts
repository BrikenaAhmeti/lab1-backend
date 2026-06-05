import { Request } from 'express';

export interface AuthenticatedUser {
    id: string;
    email: string;
    roles: string[];
}

export interface RequestWithUser extends Request {
    user: AuthenticatedUser;
}

function normalizeRoles(roles: string[] = []) {
    return roles.map((role) => role.trim().toUpperCase());
}

export function isAdminUser(user?: AuthenticatedUser): boolean {
    const roles = normalizeRoles(user?.roles ?? []);

    return roles.some((role) =>
        ['ADMIN', 'ADMINS', 'SADMIN', 'SUPER_ADMIN'].includes(role),
    );
}

export function isDoctorUser(user?: AuthenticatedUser): boolean {
    const roles = normalizeRoles(user?.roles ?? []);

    return roles.some((role) => ['DOCTOR', 'DOCTORS'].includes(role));
}

export function isDoctorScopedUser(user?: AuthenticatedUser): boolean {
    return isDoctorUser(user) && !isAdminUser(user);
}
