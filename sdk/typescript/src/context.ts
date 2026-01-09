import { AxiosInstance } from "axios";
import {
    ContextQuery,
    ContextResult,
    StaticRule,
    AuditFindingEntry,
    FrameworkPatternEntry,
    FindingSeverity,
    PatternType,
} from "./types";
import { ENDPOINTS, VULNERABILITY_CATEGORIES, SEVERITY_WEIGHTS } from "./constants";

export class ContextApi {
    private readonly http: AxiosInstance;
    private rulesCache: StaticRule[] | null = null;

    constructor(http: AxiosInstance) {
        this.http = http;
    }

    async get(query: ContextQuery): Promise<ContextResult> {
        const response = await this.http.get(ENDPOINTS.context, {
            params: {
                pattern: query.pattern,
                framework: query.framework,
                severity: query.severity,
                pattern_type: query.patternType,
            },
        });
        return response.data;
    }

    async getRules(patternType?: PatternType): Promise<StaticRule[]> {
        if (this.rulesCache && !patternType) {
            return this.rulesCache;
        }

        const result = await this.get({ patternType });
        if (!patternType) {
            this.rulesCache = result.rules;
        }
        return result.rules;
    }

    async getAuditFindings(severity?: FindingSeverity): Promise<AuditFindingEntry[]> {
        const result = await this.get({ severity });
        return result.auditFindings;
    }

    async getFrameworkPatterns(framework: string): Promise<FrameworkPatternEntry[]> {
        const result = await this.get({ framework: framework as any });
        return result.frameworkPatterns;
    }

    getVulnerabilityCategories(): readonly string[] {
        return VULNERABILITY_CATEGORIES;
    }

    calculateRiskScore(findings: AuditFindingEntry[]): number {
        if (findings.length === 0) return 100;

        let score = 100;
        for (const finding of findings) {
            const weight = SEVERITY_WEIGHTS[finding.severity] ?? 0;
            score = Math.max(0, score - weight);
        }
        return score;
    }

    categorizeFindingsBySeverity(
        findings: AuditFindingEntry[]
    ): Record<FindingSeverity, AuditFindingEntry[]> {
        const categorized: Record<FindingSeverity, AuditFindingEntry[]> = {
            critical: [],
            high: [],
            medium: [],
            info: [],
            pass: [],
        };

        for (const finding of findings) {
            categorized[finding.severity].push(finding);
        }

        return categorized;
    }

    clearCache(): void {
        this.rulesCache = null;
    }
}
