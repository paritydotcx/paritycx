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
            totalAuditors: 0,
            totalPatterns: 10,
            verifiedCount,
            averageScore: Math.round(averageScore * 100) / 100,
        });
    } catch (error) {
        next(error);
    }
});

programsRouter.get("/:hash", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { hash } = req.params;
        const program = programStore.get(hash);

        if (!program) {
            throw new AppError(`Program with hash '${hash}' not found`, 404);
        }

        res.json(program);
    } catch (error) {
        next(error);
    }
});

programsRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { programHash, framework, metadataUri } = req.body;

        if (!programHash || !framework) {
            throw new AppError("programHash and framework are required", 422);
        }

        if (programStore.has(programHash)) {
            throw new AppError("Program already registered", 409);
        }

        const program: StoredProgram = {
            id: programHash,
            owner: (req as any).userId || "anonymous",
            programHash,
            framework,
            metadataUri: metadataUri || "",
            registeredAt: new Date().toISOString(),
            analysisCount: 0,
            latestScore: 0,
            isVerified: false,
        };

        programStore.set(programHash, program);

        res.status(201).json(program);
    } catch (error) {
        next(error);
    }
});
