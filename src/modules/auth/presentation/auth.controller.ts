import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthPrismaRepository } from '../infrastructure/auth.prisma.repository';
import { AuthService } from '../services/auth.service';
import { RequestWithUser } from '../../../shared/core/types/request-with-user';

const registerSchema = z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    email: z.string().email(),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/).optional(),
    password: z.string().min(6).max(255),
    phoneNumber: z.string().max(30).optional(),
});

const loginSchema = z.object({
    identifier: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    password: z.string().min(1).max(255),
}).refine((data) => Boolean(data.identifier || data.email), {
    message: 'identifier or email is required',
});

const refreshSchema = z.object({
    refreshToken: z.string().min(1),
});

const createUserSchema = z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    email: z.string().email(),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/).optional(),
    password: z.string().min(6).max(255),
    phoneNumber: z.string().max(30).optional(),
    emailConfirmed: z.boolean().optional(),
    lockoutEnabled: z.boolean().optional(),
    isActive: z.boolean().optional(),
    roleIds: z.array(z.string().min(1)).optional(),
});

const updateUserSchema = z.object({
    firstName: z.string().min(2).max(100).optional(),
    lastName: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/).optional(),
    password: z.string().min(6).max(255).optional(),
    phoneNumber: z.string().max(30).nullable().optional(),
    emailConfirmed: z.boolean().optional(),
    lockoutEnabled: z.boolean().optional(),
    isActive: z.boolean().optional(),
    roleIds: z.array(z.string().min(1)).optional(),
});

const setUserStatusSchema = z.object({
    isActive: z.boolean(),
});

const createRoleSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(255).optional(),
    isActive: z.boolean().optional(),
});

const updateRoleSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(255).nullable().optional(),
    isActive: z.boolean().optional(),
});

const assignRoleSchema = z.object({
    roleId: z.string().min(1),
});

const replaceRolesSchema = z.object({
    roleIds: z.array(z.string().min(1)),
});

const paramsWithIdSchema = z.object({
    id: z.string().min(1),
});

const userRoleParamsSchema = z.object({
    userId: z.string().min(1),
    roleId: z.string().min(1),
});

const userParamsSchema = z.object({
    userId: z.string().min(1),
});

const roleParamsSchema = z.object({
    roleId: z.string().min(1),
});

export class AuthController {
    private readonly repository = new AuthPrismaRepository();
    private readonly service = new AuthService(this.repository);

    async register(req: Request, res: Response) {
        const body = registerSchema.parse(req.body);
        const result = await this.service.register(body);

        return res.status(201).json(result);
    }

    async login(req: Request, res: Response) {
        const body = loginSchema.parse(req.body);
        const result = await this.service.login({
            identifier: body.identifier ?? body.email ?? '',
            password: body.password,
        });

        return res.status(200).json(result);
    }

    async refresh(req: Request, res: Response) {
        const body = refreshSchema.parse(req.body);
        const result = await this.service.refresh(body.refreshToken);

        return res.status(200).json(result);
    }

    async logout(req: Request, res: Response) {
        const body = refreshSchema.parse(req.body);

        await this.service.logout(body.refreshToken);

        return res.status(204).send();
    }

    async me(req: Request, res: Response) {
        const requestWithUser = req as RequestWithUser;
        const result = await this.service.getCurrentUser(requestWithUser.user.id);

        return res.status(200).json(result);
    }

    async listUsers(_req: Request, res: Response) {
        const result = await this.service.listUsers();

        return res.status(200).json(result);
    }

    async getUserById(req: Request, res: Response) {
        const params = paramsWithIdSchema.parse(req.params);
        const result = await this.service.getUserById(params.id);

        return res.status(200).json(result);
    }

    async createUser(req: Request, res: Response) {
        const body = createUserSchema.parse(req.body);
        const result = await this.service.createUser(body);

        return res.status(201).json(result);
    }

    async updateUser(req: Request, res: Response) {
        const params = paramsWithIdSchema.parse(req.params);
        const body = updateUserSchema.parse(req.body);
        const result = await this.service.updateUser(params.id, body);

        return res.status(200).json(result);
    }

    async deleteUser(req: Request, res: Response) {
        const params = paramsWithIdSchema.parse(req.params);

        await this.service.deleteUser(params.id);

        return res.status(204).send();
    }

    async setUserStatus(req: Request, res: Response) {
        const params = paramsWithIdSchema.parse(req.params);
        const body = setUserStatusSchema.parse(req.body);
        const result = await this.service.setUserStatus(params.id, body.isActive);

        return res.status(200).json(result);
    }

    async listRoles(_req: Request, res: Response) {
        const result = await this.service.listRoles();

        return res.status(200).json(result);
    }

    async createRole(req: Request, res: Response) {
        const body = createRoleSchema.parse(req.body);
        const result = await this.service.createRole(body);

        return res.status(201).json(result);
    }

    async updateRole(req: Request, res: Response) {
        const params = roleParamsSchema.parse(req.params);
        const body = updateRoleSchema.parse(req.body);
        const result = await this.service.updateRole(params.roleId, body);

        return res.status(200).json(result);
    }

    async deleteRole(req: Request, res: Response) {
        const params = roleParamsSchema.parse(req.params);

        await this.service.deleteRole(params.roleId);

        return res.status(204).send();
    }

    async listUserRoles(req: Request, res: Response) {
        const params = userParamsSchema.parse(req.params);
        const result = await this.service.listUserRoles(params.userId);

        return res.status(200).json(result);
    }

    async assignRoleToUser(req: Request, res: Response) {
        const params = userParamsSchema.parse(req.params);
        const body = assignRoleSchema.parse(req.body);
        const result = await this.service.assignRoleToUser(params.userId, body.roleId);

        return res.status(200).json(result);
    }

    async removeRoleFromUser(
        req: Request,
        res: Response,
    ) {
        const params = userRoleParamsSchema.parse(req.params);
        const result = await this.service.removeRoleFromUser(params.userId, params.roleId);

        return res.status(200).json(result);
    }

    async replaceUserRoles(req: Request, res: Response) {
        const params = userParamsSchema.parse(req.params);
        const body = replaceRolesSchema.parse(req.body);
        const result = await this.service.replaceUserRoles(params.userId, body.roleIds);

        return res.status(200).json(result);
    }

    async listUserRefreshTokens(req: Request, res: Response) {
        const params = userParamsSchema.parse(req.params);
        const result = await this.service.listUserRefreshTokens(params.userId);

        return res.status(200).json(result);
    }

    async revokeUserRefreshTokens(req: Request, res: Response) {
        const params = userParamsSchema.parse(req.params);

        await this.service.revokeUserRefreshTokens(params.userId);

        return res.status(204).send();
    }
}
