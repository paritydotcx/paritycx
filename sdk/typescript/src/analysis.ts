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