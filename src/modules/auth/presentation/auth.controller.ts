import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthPrismaRepository } from '../infrastructure/auth.prisma.repository';
import { AuthService } from '../services/auth.service';
import { RequestWithUser } from '../../../shared/core/types/request-with-user';
import { AppError } from '../../../shared/core/errors/app-error';
import {
    validateChangePasswordDto,
    validateAssignRoleDto,
    validateCreateRoleDto,
    validateCreateUserDto,
    validateLoginDto,
    validateRegisterDto,
    validateReplaceRolesDto,
    validateSetUserPasswordDto,
    validateSetUserStatusDto,
    validateUpdateRoleDto,
    validateUpdateUserDto,
} from '../dto/auth.dto';
import {
    clearRefreshTokenCookie,
    readRefreshToken,
    setRefreshTokenCookie,
} from './auth.cookies';

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
        const body = validateRegisterDto(req.body);
        const result = await this.service.register(body);
        setRefreshTokenCookie(res, result.refreshToken);

        return res.status(201).json(result);
    }

    async login(req: Request, res: Response) {
        const body = validateLoginDto(req.body);
        const result = await this.service.login({
            identifier: body.identifier ?? body.email ?? '',
            password: body.password,
        });
        setRefreshTokenCookie(res, result.refreshToken);

        return res.status(200).json(result);
    }

    async refresh(req: Request, res: Response) {
        const refreshToken = readRefreshToken(req);

        if (!refreshToken) {
            throw new AppError('Refresh token is required', 400);
        }

        const result = await this.service.refresh(refreshToken);
        setRefreshTokenCookie(res, result.refreshToken);

        return res.status(200).json(result);
    }

    async logout(req: Request, res: Response) {
        const refreshToken = readRefreshToken(req);

        if (!refreshToken) {
            throw new AppError('Refresh token is required', 400);
        }

        await this.service.logout(refreshToken);
        clearRefreshTokenCookie(res);

        return res.status(204).send();
    }

    async logoutAll(req: Request, res: Response) {
        const requestWithUser = req as RequestWithUser;

        await this.service.logoutAll(requestWithUser.user.id);
        clearRefreshTokenCookie(res);

        return res.status(204).send();
    }

    async me(req: Request, res: Response) {
        const requestWithUser = req as RequestWithUser;
        const result = await this.service.getCurrentUser(requestWithUser.user.id);

        return res.status(200).json(result);
    }

    async changePassword(req: Request, res: Response) {
        const requestWithUser = req as RequestWithUser;
        const body = validateChangePasswordDto(req.body);

        await this.service.changePassword(
            requestWithUser.user.id,
            body.currentPassword,
            body.newPassword,
        );
        clearRefreshTokenCookie(res);

        return res.status(204).send();
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
        const body = validateCreateUserDto(req.body);
        const result = await this.service.createUser(body);

        return res.status(201).json(result);
    }

    async updateUser(req: Request, res: Response) {
        const params = paramsWithIdSchema.parse(req.params);
        const body = validateUpdateUserDto(req.body);
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
        const body = validateSetUserStatusDto(req.body);
        const result = await this.service.setUserStatus(params.id, body.isActive);

        return res.status(200).json(result);
    }

    async setUserPassword(req: Request, res: Response) {
        const params = paramsWithIdSchema.parse(req.params);
        const body = validateSetUserPasswordDto(req.body);

        await this.service.setUserPassword(params.id, body.password);

        return res.status(204).send();
    }

    async listRoles(_req: Request, res: Response) {
        const result = await this.service.listRoles();

        return res.status(200).json(result);
    }

    async createRole(req: Request, res: Response) {
        const body = validateCreateRoleDto(req.body);
        const result = await this.service.createRole(body);

        return res.status(201).json(result);
    }

    async updateRole(req: Request, res: Response) {
        const params = roleParamsSchema.parse(req.params);
        const body = validateUpdateRoleDto(req.body);
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
        const body = validateAssignRoleDto(req.body);
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
        const body = validateReplaceRolesDto(req.body);
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
