import * as yaml from "yaml";
import * as fs from "fs";
import * as path from "path";
import { SkillDefinition, SkillInput, SkillOutput } from "./types";

interface SkillFrontmatter {
    name: string;
    version: string;
    description: string;
    inputs?: Array<{
        name: string;
        type: string;
        required?: boolean;
        default?: string;
    }>;
    outputs?: Array<{
        name: string;
        type: string;
    }>;
}

export class SkillParser {
    static parse(content: string): SkillDefinition {
        const { frontmatter, body } = SkillParser.splitFrontmatter(content);
        const meta = yaml.parse(frontmatter) as SkillFrontmatter;

        const inputs: SkillInput[] = (meta.inputs ?? []).map((input) => ({
            name: input.name,
            type: input.type,
            required: input.required ?? false,
            default: input.default,
        }));

        const outputs: SkillOutput[] = (meta.outputs ?? []).map((output) => ({
            name: output.name,
            type: output.type,
        }));

        const steps = SkillParser.extractSteps(body);

        return {
            name: meta.name,
            version: meta.version,
            description: meta.description,
            inputs,
            outputs,
            steps,
        };
    }

    static parseFile(filePath: string): SkillDefinition {
        const absolutePath = path.resolve(filePath);
        const content = fs.readFileSync(absolutePath, "utf-8");
        return SkillParser.parse(content);
    }

    static serialize(skill: SkillDefinition): string {
        const frontmatter: SkillFrontmatter = {
            name: skill.name,
            version: skill.version,
            description: skill.description,
            inputs: skill.inputs.map((i) => ({
                name: i.name,
                type: i.type,
                required: i.required,
                default: i.default,
            })),
            outputs: skill.outputs.map((o) => ({
                name: o.name,
                type: o.type,
            })),
        };