import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AnalysisService } from "../services/analysis";
import { AppError } from "../middleware/error";

export const analyzeRouter = Router();

const analyzeSchema = z.object({
    program: z.string().min(1, "Program source is required"),
    framework: z.enum(["anchor", "native", "seahorse", "steel"]).default("anchor"),
    skills: z
        .array(z.string())
        .min(1)
        .max(8)
        .default(["security-audit"]),
    output: z.enum(["json", "sarif", "markdown", "text"]).default("json"),
});

analyzeRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = analyzeSchema.safeParse(req.body);

        if (!parsed.success) {
            throw new AppError("Validation failed", 422, parsed.error.issues);
        }

        const { program, framework, skills, output } = parsed.data;

        const analysisService = new AnalysisService();
        const result = await analysisService.analyze(program, framework, skills);

        if (output === "sarif") {
            res.json(analysisService.toSarif(result, "uploaded-program.rs"));
            return;
        }

        if (output === "markdown") {
            res.type("text/markdown").send(analysisService.toMarkdown(result));
            return;
        }

        if (output === "text") {
            res.type("text/plain").send(analysisService.toText(result));
            return;