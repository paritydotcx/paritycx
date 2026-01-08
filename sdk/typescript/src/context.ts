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