import { Router, Request, Response, NextFunction } from "express";
import { ContextService } from "../services/context";

export const contextRouter = Router();
const contextService = new ContextService();

contextRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pattern, framework, severity, pattern_type } = req.query;

        const result = contextService.query({
            pattern: pattern as string | undefined,
            framework: framework as string | undefined,
            severity: severity as string | undefined,
            patternType: pattern_type as string | undefined,
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});

contextRouter.get("/rules", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pattern_type } = req.query;
        const rules = contextService.getRules(pattern_type as string | undefined);
        res.json(rules);
    } catch (error) {
        next(error);
    }
});

contextRouter.get("/findings", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { severity } = req.query;
        const findings = contextService.getAuditFindings(severity as string | undefined);
        res.json(findings);
    } catch (error) {
        next(error);
    }
});

contextRouter.get("/patterns", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { framework } = req.query;
        const patterns = contextService.getFrameworkPatterns(
            (framework as string) || "anchor"
        );
        res.json(patterns);
    } catch (error) {
        next(error);
    }
});

contextRouter.get("/categories", async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = contextService.getVulnerabilityCategories();
        res.json(categories);
    } catch (error) {
        next(error);
    }
});
