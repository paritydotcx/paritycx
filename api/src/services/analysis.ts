interface AnalysisResult {
    score: number;
    findings: Finding[];
    summary: string;
    skills: string[];
    metadata: {
        framework: string;
        analyzedAt: string;
        duration: number;
    };
}

interface Finding {
    severity: "critical" | "high" | "medium" | "info" | "pass";
    title: string;
    location: { file: string; line: number; instruction?: string };
    description: string;
    recommendation: string;
    pattern: string;
}

interface VulnerabilityCheck {
    pattern: string;
    check: (source: string) => Finding[];
}

const SEVERITY_WEIGHT: Record<string, number> = {
    critical: 25,
    high: 15,
    medium: 8,
    info: 3,
    pass: 0,
};

export class AnalysisService {
    private readonly checks: VulnerabilityCheck[];

    constructor() {
        this.checks = this.initializeChecks();
    }

    async analyze(
        source: string,
        framework: string,
        skills: string[]
    ): Promise<AnalysisResult> {
        const startTime = Date.now();
        const findings: Finding[] = [];

        for (const check of this.checks) {
            const results = check.check(source);
            findings.push(...results);
        }

        if (skills.includes("best-practices")) {
            findings.push(...this.checkBestPractices(source, framework));
        }

        if (skills.includes("gas-optimization")) {
            findings.push(...this.checkGasOptimization(source));
        }

        const score = this.calculateScore(findings);
        const duration = Date.now() - startTime;

        return {
            score,
            findings,
            summary: this.generateSummary(findings, score),
            skills,
            metadata: {
                framework,
                analyzedAt: new Date().toISOString(),
                duration,
            },
        };
    }

    private initializeChecks(): VulnerabilityCheck[] {
        return [
            {
                pattern: "missing-signer-check",
                check: (source: string): Finding[] => {
                    const findings: Finding[] = [];
                    const lines = source.split("\n");

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        if (
                            line.includes("pub authority") &&
                            !line.includes("Signer") &&
                            line.includes("AccountInfo")
                        ) {
                            findings.push({
                                severity: "critical",
                                title: "Missing signer check on authority account",
                                location: { file: "program.rs", line: i + 1, instruction: this.findInstruction(lines, i) },
                                description: