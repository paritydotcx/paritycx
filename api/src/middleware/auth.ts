import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || process.env.PARITY_KEY || "parity-dev-secret";

export interface AuthenticatedRequest extends Request {
    userId?: string;
    apiKeyId?: string;
}

export function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({
            error: "Unauthorized",
            message: "Missing Authorization header. Use: Bearer <api_key>",
        });
        return;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        res.status(401).json({
            error: "Unauthorized",
            message: "Invalid Authorization format. Use: Bearer <api_key>",
        });
        return;
    }

    const token = parts[1];

    try {
        if (token.startsWith("pk_")) {
            req.apiKeyId = token;
            req.userId = extractUserFromApiKey(token);
            next();
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; iat: number };
        req.userId = decoded.sub;
        next();
    } catch (error: any) {
        logger.warn(`Authentication failed: ${error.message}`);
        res.status(401).json({
            error: "Unauthorized",
            message: "Invalid or expired authentication token",
        });
    }
}

function extractUserFromApiKey(apiKey: string): string {
    const parts = apiKey.split("_");
    if (parts.length >= 3) {
        return parts[1];
    }
    return "anonymous";
}

export function requireRole(role: string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.userId) {
            res.status(403).json({
                error: "Forbidden",
                message: "Insufficient permissions",
            });
            return;
        }
        next();
    };
}
