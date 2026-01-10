import { AxiosInstance } from "axios";
import * as fs from "fs";
import * as path from "path";
import {
    AnalyzeOptions,
    AnalysisResult,
    Finding,
    FindingSeverity,
    AnalysisFindingsCount,
} from "./types";
import {
    ENDPOINTS,
    SKILL_NAMES,
    SEVERITY_WEIGHTS,
    MAX_PROGRAM_SIZE,
    MAX_SKILLS_PER_ANALYSIS,
} from "./constants";
import { SkillsApi } from "./skills";
import { ContextApi } from "./context";

export class AnalysisEngine {
    private readonly http: AxiosInstance;
    private readonly skills: SkillsApi;
    private readonly context: ContextApi;

    constructor(http: AxiosInstance, skills: SkillsApi, context: ContextApi) {
        this.http = http;
        this.skills = skills;
        this.context = context;
    }

    async analyze(options: AnalyzeOptions): Promise<AnalysisResult> {
        this.validateOptions(options);

        const programSource = this.readProgramSource(options.program);
        const resolvedSkills = options.skills ?? [SKILL_NAMES.SECURITY_AUDIT];
        const framework = options.framework ?? this.detectFramework(programSource);

        await this.validateSkills(resolvedSkills);

        const response = await this.http.post(ENDPOINTS.analyze, {
            program: programSource,
            framework,
            skills: resolvedSkills,
            output: options.output ?? "json",
        });

        const result: AnalysisResult = response.data;

        if (options.minScore !== undefined && result.score < options.minScore) {
            throw new AnalysisScoreError(
                `Analysis score ${result.score} is below the minimum threshold ${options.minScore}`,
                result.score,
                options.minScore
            );
        }

        if (options.failOn && options.failOn.length > 0) {
            const failingFindings = result.findings.filter((f) =>
                options.failOn!.includes(f.severity)
            );
            if (failingFindings.length > 0) {
                throw new AnalysisFindingsError(
                    `Found ${failingFindings.length} findings with severity: ${options.failOn.join(", ")}`,
                    failingFindings
                );
            }
        }

        return result;
    }

    private validateOptions(options: AnalyzeOptions): void {
        if (!options.program) {
            throw new ParityValidationError("Program path is required");
        }

        if (options.skills && options.skills.length > MAX_SKILLS_PER_ANALYSIS) {
            throw new ParityValidationError(
                `Maximum ${MAX_SKILLS_PER_ANALYSIS} skills per analysis, got ${options.skills.length}`
            );
        }

        if (options.minScore !== undefined && (options.minScore < 0 || options.minScore > 100)) {
            throw new ParityValidationError("minScore must be between 0 and 100");
        }
    }

    private readProgramSource(programPath: string): string {
        const absolutePath = path.resolve(programPath);

        if (!fs.existsSync(absolutePath)) {
            throw new ParityValidationError(`Program file not found: ${absolutePath}`);
        }

        const stats = fs.statSync(absolutePath);
        if (stats.size > MAX_PROGRAM_SIZE) {
            throw new ParityValidationError(
                `Program file exceeds maximum size of ${MAX_PROGRAM_SIZE} bytes`
            );
        }

        return fs.readFileSync(absolutePath, "utf-8");
    }

    private detectFramework(source: string): string {
        if (source.includes("#[program]") || source.includes("declare_id!")) {
            return "anchor";
        }
        if (source.includes("entrypoint!")) {
            return "native";
        }
        if (source.includes("@instruction") || source.includes("seahorse")) {
            return "seahorse";
        }
        return "anchor";
    }

    private async validateSkills(skillNames: string[]): Promise<void> {
        for (const name of skillNames) {
            const isValid = await this.skills.validate(name);
            if (!isValid) {
                throw new ParityValidationError(`Unknown skill: ${name}`);
            }
        }
    }

    static countFindings(findings: Finding[]): AnalysisFindingsCount {
        const count: AnalysisFindingsCount = {
            critical: 0,
            high: 0,
            medium: 0,
            info: 0,
            pass: 0,
            total: 0,
        };

        for (const finding of findings) {
            count[finding.severity]++;
            count.total++;
        }

        return count;
    }

    static calculateScore(findings: Finding[]): number {
        if (findings.length === 0) return 100;

        let score = 100;
        for (const finding of findings) {
            const weight = SEVERITY_WEIGHTS[finding.severity] ?? 0;
            score = Math.max(0, score - weight);
        }
        return score;
    }

    static generateSummary(findings: Finding[], score: number): string {
        const counts = AnalysisEngine.countFindings(findings);
        const parts: string[] = [];

        if (counts.critical > 0) parts.push(`${counts.critical} critical`);
        if (counts.high > 0) parts.push(`${counts.high} high`);
        if (counts.medium > 0) parts.push(`${counts.medium} medium`);
        if (counts.info > 0) parts.push(`${counts.info} info`);

        if (parts.length === 0) {
            return `Analysis complete with a perfect score of ${score}. No issues found.`;
        }

        return `Found ${parts.join(" and ")} severity issues. Overall score: ${score}/100.`;
    }

    static formatFindingsAsMarkdown(findings: Finding[]): string {
        const lines: string[] = ["# Analysis Findings\n"];

        const grouped: Record<FindingSeverity, Finding[]> = {
            critical: [],
            high: [],
            medium: [],
            info: [],
            pass: [],
        };

        for (const finding of findings) {
            grouped[finding.severity].push(finding);
        }

        for (const severity of ["critical", "high", "medium", "info", "pass"] as FindingSeverity[]) {
            const group = grouped[severity];
            if (group.length === 0) continue;

            lines.push(`## ${severity.toUpperCase()} (${group.length})\n`);

            for (const finding of group) {
                lines.push(`### ${finding.title}`);
                lines.push(`- **Location**: ${finding.location.file}:${finding.location.line}`);
                if (finding.location.instruction) {
                    lines.push(`- **Instruction**: ${finding.location.instruction}`);
                }
                lines.push(`- **Pattern**: ${finding.pattern}`);
                lines.push(`\n${finding.description}\n`);
                lines.push(`**Recommendation**: ${finding.recommendation}\n`);
            }
        }

        return lines.join("\n");
    }

    static formatFindingsAsSarif(findings: Finding[], programPath: string): object {
        return {
            $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json",
            version: "2.1.0",
            runs: [
                {
                    tool: {
                        driver: {
                            name: "parity",
                            version: "0.3.0",
                            informationUri: "https://parity.cx",
                            rules: findings.map((f) => ({
                                id: f.pattern,
                                shortDescription: { text: f.title },
                                fullDescription: { text: f.description },
                                defaultConfiguration: {
                                    level: f.severity === "critical" || f.severity === "high" ? "error" : "warning",
                                },
                            })),
                        },
                    },
                    results: findings.map((f) => ({
                        ruleId: f.pattern,
                        level: f.severity === "critical" || f.severity === "high" ? "error" : "warning",
                        message: { text: f.description },
                        locations: [
                            {
                                physicalLocation: {
                                    artifactLocation: { uri: f.location.file },
                                    region: { startLine: f.location.line },
                                },
                            },
                        ],
                        fixes: [
                            {
                                description: { text: f.recommendation },
                            },
                        ],
                    })),
                    artifacts: [{ location: { uri: programPath } }],
                },
            ],
        };
    }
}

export class ParityValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ParityValidationError";
    }
}

export class AnalysisScoreError extends Error {
    public readonly actualScore: number;
    public readonly minScore: number;

    constructor(message: string, actualScore: number, minScore: number) {
        super(message);
        this.name = "AnalysisScoreError";
        this.actualScore = actualScore;
        this.minScore = minScore;
    }
}

export class AnalysisFindingsError extends Error {
    public readonly findings: Finding[];

    constructor(message: string, findings: Finding[]) {
        super(message);
        this.name = "AnalysisFindingsError";
        this.findings = findings;
    }
}
