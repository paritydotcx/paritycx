import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export interface ApiError {
    status: number;
    error: string;
    message: string;
    details?: any;
}

export class AppError extends Error {
    public readonly status: number;
    public readonly details?: any;

    constructor(message: string, status: number = 500, details?: any) {
        super(message);
        this.name = "AppError";
        this.status = status;
        this.details = details;
    }
}

// Centralised error handler -- normalises all errors into a consistent JSON envelope
export function errorHandler(
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    const status = err instanceof AppError ? err.status : 500;
    const message = err.message || "Internal server error";

    if (status >= 500) {
        logger.error(`Server error: ${message}`, {
            stack: err.stack,
            details: err instanceof AppError ? err.details : undefined,
        });
    } else {
        logger.warn(`Client error: ${message}`);
    }

    const response: ApiError = {
        status,
        error: getErrorName(status),
        message,
    };

    if (err instanceof AppError && err.details) {
        response.details = err.details;
    }

    res.status(status).json(response);
}

function getErrorName(status: number): string {
    const names: Record<number, string> = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        409: "Conflict",
        422: "Unprocessable Entity",
        429: "Too Many Requests",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
    };
    return names[status] || "Error";
}
