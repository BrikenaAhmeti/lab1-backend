import { authorizeRoles } from '../../src/shared/middleware/authorize-roles';
import { AppError } from '../../src/shared/core/errors/app-error';
import { RequestWithUser } from '../../src/shared/core/types/request-with-user';

describe('authorizeRoles', () => {
    it('should allow SADMIN tokens on admin-only routes', () => {
        const middleware = authorizeRoles('ADMIN');
        const next = jest.fn();
        const req = {
            user: {
                id: 'user-1',
                email: 'admin@example.com',
                roles: ['SADMIN'],
            },
        } as unknown as RequestWithUser;

        middleware(req, {} as never, next);

        expect(next).toHaveBeenCalled();
    });

    it('should allow ADMIN tokens on super-admin routes', () => {
        const middleware = authorizeRoles('SUPER_ADMIN');
        const next = jest.fn();
        const req = {
            user: {
                id: 'user-1',
                email: 'admin@example.com',
                roles: ['ADMIN'],
            },
        } as unknown as RequestWithUser;

        middleware(req, {} as never, next);

        expect(next).toHaveBeenCalled();
    });

    it('should still reject unrelated roles', () => {
        const middleware = authorizeRoles('ADMIN');
        const next = jest.fn();
        const req = {
            user: {
                id: 'user-2',
                email: 'doctor@example.com',
                roles: ['DOCTOR'],
            },
        } as unknown as RequestWithUser;

        expect(() => middleware(req, {} as never, next)).toThrow(AppError);
        expect(next).not.toHaveBeenCalled();
    });
});
