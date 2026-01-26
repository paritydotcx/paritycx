import { Router, Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error";

export const programsRouter = Router();

interface StoredProgram {
    id: string;
    owner: string;
    programHash: string;
    framework: string;
    metadataUri: string;
    registeredAt: string;
    analysisCount: number;
    latestScore: number;
    isVerified: boolean;
}

const programStore: Map<string, StoredProgram> = new Map();

programsRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

        const allPrograms = Array.from(programStore.values());
        const start = (page - 1) * limit;
        const programs = allPrograms.slice(start, start + limit);

        res.json({
            data: programs,
            pagination: {
                page,
                limit,
                total: allPrograms.length,
                totalPages: Math.ceil(allPrograms.length / limit),
            },
        });
    } catch (error) {
        next(error);
    }
});

programsRouter.get("/stats", async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const programs = Array.from(programStore.values());
        const totalPrograms = programs.length;
        const totalAnalyses = programs.reduce((sum, p) => sum + p.analysisCount, 0);
        const verifiedCount = programs.filter((p) => p.isVerified).length;
        const averageScore =
            totalPrograms > 0
                ? programs.reduce((sum, p) => sum + p.latestScore, 0) / totalPrograms
                : 0;

        res.json({
            totalPrograms,
            totalAnalyses,
            totalSkills: 4,