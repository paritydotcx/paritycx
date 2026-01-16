import { Router, Request, Response } from "express";

export const healthRouter = Router();

const startTime = Date.now();

healthRouter.get("/", (_req: Request, res: Response) => {
    const uptime = Date.now() - startTime;

    res.json({
        status: "healthy",
        version: "0.3.0",
        uptime,
        timestamp: new Date().toISOString(),
        services: {
            api: "operational",
            analysis: "operational",
            context: "operational",
        },
    });
});

healthRouter.get("/ready", (_req: Request, res: Response) => {
    res.json({
        ready: true,
        checks: {
            api: true,
            skills: true,
            context: true,
        },
    });
});
