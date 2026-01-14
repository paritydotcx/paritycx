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

        const yamlStr = yaml.stringify(frontmatter);
        const body = SkillParser.generateBody(skill);

        return `---\n${yamlStr}---\n\n${body}`;
    }

    static validate(content: string): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        try {
            const { frontmatter } = SkillParser.splitFrontmatter(content);
            const meta = yaml.parse(frontmatter) as SkillFrontmatter;

            if (!meta.name) errors.push("Missing required field: name");
            if (!meta.version) errors.push("Missing required field: version");
            if (!meta.description) errors.push("Missing required field: description");

            if (meta.name && meta.name.length > 64) {
                errors.push("Skill name exceeds 64 characters");
            }

            if (meta.version && !/^\d+\.\d+\.\d+$/.test(meta.version)) {
                errors.push("Version must follow semver format (x.y.z)");
            }

            if (meta.inputs) {
                for (const input of meta.inputs) {
                    if (!input.name) errors.push("Input missing name");
                    if (!input.type) errors.push(`Input '${input.name}' missing type`);
                }
            }

            if (meta.outputs) {
                for (const output of meta.outputs) {
                    if (!output.name) errors.push("Output missing name");
                    if (!output.type) errors.push(`Output '${output.name}' missing type`);
                }
            }
        } catch (e: any) {
            errors.push(`Parse error: ${e.message}`);
        }

        return { valid: errors.length === 0, errors };
    }

    private static splitFrontmatter(content: string): {
        frontmatter: string;
        body: string;
    } {
        const trimmed = content.trim();
        if (!trimmed.startsWith("---")) {
            throw new Error("SKILL.md must start with YAML frontmatter (---)");
        }

        const endIndex = trimmed.indexOf("---", 3);
        if (endIndex === -1) {
            throw new Error("SKILL.md frontmatter missing closing ---");
        }

        return {
            frontmatter: trimmed.substring(3, endIndex).trim(),
            body: trimmed.substring(endIndex + 3).trim(),
        };
    }

    private static extractSteps(body: string): string[] {
        const steps: string[] = [];
        const lines = body.split("\n");

        let inSteps = false;
        for (const line of lines) {
            if (line.toLowerCase().includes("## steps") || line.toLowerCase().includes("## analysis steps")) {
                inSteps = true;
                continue;
            }

            if (inSteps && line.startsWith("## ")) {
                break;
            }

            if (inSteps) {
                const match = line.match(/^\d+\.\s+(.+)/);
                if (match) {
                    steps.push(match[1].trim());
                }
            }
        }

        return steps;
    }

    private static generateBody(skill: SkillDefinition): string {
        const lines: string[] = [];
        lines.push(`# ${skill.name}`);
        lines.push("");
        lines.push(skill.description);
        lines.push("");

        if (skill.steps && skill.steps.length > 0) {
            lines.push("## Steps");
            skill.steps.forEach((step, i) => {
                lines.push(`${i + 1}. ${step}`);
            });
        }

        return lines.join("\n");
    }
}
