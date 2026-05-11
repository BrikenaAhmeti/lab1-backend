import { Prisma } from '../../src/generated/prisma';
import { errorHandler } from '../../src/shared/middleware/error-handler';

function createResponseMock() {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    return {
        json,
        status,
    };
}

describe('errorHandler', () => {
    it('should map Prisma foreign key errors to a 409 response', () => {
        const res = createResponseMock();
        const error = new Prisma.PrismaClientKnownRequestError(
            'Foreign key constraint failed',
            {
                code: 'P2003',
                clientVersion: 'test',
            },
        );

        errorHandler(error, {} as never, res as never, {} as never);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Resource cannot be deleted while it is in use',
            statusCode: 409,
        });
    });

    it('should map Prisma missing record errors to a 404 response', () => {
        const res = createResponseMock();
        const error = new Prisma.PrismaClientKnownRequestError(
            'Record does not exist',
            {
                code: 'P2025',
                clientVersion: 'test',
            },
        );

        errorHandler(error, {} as never, res as never, {} as never);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Resource not found',
            statusCode: 404,
        });
    });
});
