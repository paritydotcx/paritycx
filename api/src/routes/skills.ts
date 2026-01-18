import { Router, Request, Response, NextFunction } from "express";
import { SkillsService } from "../services/skills";
import { AppError } from "../middleware/error";

export const skillsRouter = Router();
const skillsService = new SkillsService();

skillsRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const skills = skillsService.listSkills();
        res.json(skills);
    } catch (error) {
        next(error);
    }
});

skillsRouter.get("/:name", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.params;
        const skill = skillsService.getSkill(name);

        if (!skill) {
            throw new AppError(`Skill '${name}' not found`, 404);
        }

        res.json(skill);
    } catch (error) {
        next(error);
    }
});

skillsRouter.get("/:name/chain", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.params;
        const chain = skillsService.getSkillChain(name);
        res.json({ skill: name, chain });
    } catch (error) {
        next(error);
    }
});
