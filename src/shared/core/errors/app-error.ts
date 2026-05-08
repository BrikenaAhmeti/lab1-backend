export interface AppErrorDetail {
    field?: string;
    message: string;
}

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errors?: AppErrorDetail[];

    constructor(
        message: string,
        statusCode = 400,
        errors?: AppErrorDetail[],
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
