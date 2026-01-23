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
                                    "The authority account is declared as AccountInfo without a Signer constraint. Any user can impersonate the authority and execute privileged operations.",
                                recommendation:
                                    "Replace AccountInfo with Signer<'info> or add an is_signer check.",
                                pattern: "missing-signer-check",
                            });
                        }
                    }

                    return findings;
                },
            },
            {
                pattern: "unchecked-arithmetic",
                check: (source: string): Finding[] => {
                    const findings: Finding[] = [];
                    const lines = source.split("\n");
                    const unsafeOps = /\b\w+\s*[\+\-\*]\s*\w+/;
                    const safeOps = /checked_|saturating_|overflowing_/;

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (
                            unsafeOps.test(line) &&
                            !safeOps.test(line) &&
                            !line.startsWith("//") &&
                            !line.startsWith("*") &&
                            !line.startsWith("///") &&
                            (line.includes("amount") ||
                                line.includes("balance") ||
                                line.includes("total") ||
                                line.includes("supply") ||
                                line.includes("lamports"))
                        ) {
                            findings.push({
                                severity: "high",
                                title: "Potential unchecked arithmetic in token-related operation",
                                location: { file: "program.rs", line: i + 1 },
                                description:
                                    "An arithmetic operation involving token amounts or balances does not use checked math. This could lead to overflow or underflow, resulting in incorrect balances or fund loss.",
                                recommendation:
                                    "Use checked_add(), checked_sub(), or checked_mul() for all arithmetic operations involving user-controlled values.",
                                pattern: "unchecked-arithmetic",
                            });
                        }
                    }

                    return findings;
                },
            },
            {
                pattern: "unvalidated-pda",
                check: (source: string): Finding[] => {
                    const findings: Finding[] = [];
                    const lines = source.split("\n");

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        if (
                            line.includes("find_program_address") &&
                            !source.substring(
                                Math.max(0, source.indexOf(line) - 200),
                                source.indexOf(line) + line.length + 200
                            ).includes("bump")
                        ) {
                            findings.push({
                                severity: "critical",
                                title: "PDA derivation without bump validation",
                                location: { file: "program.rs", line: i + 1 },
                                description:
                                    "A PDA is derived using find_program_address but the bump seed is not stored or validated. An attacker could use a different bump to derive a different address.",
                                recommendation:
                                    "Store the canonical bump in the PDA account data and validate it in subsequent instructions using seeds and bump constraints.",
                                pattern: "unvalidated-pda",
                            });
                        }
                    }

                    return findings;
                },
            },
            {
                pattern: "insecure-cpi",
                check: (source: string): Finding[] => {
                    const findings: Finding[] = [];
                    const lines = source.split("\n");

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        if (
                            line.includes("invoke(") &&
                            !line.includes("invoke_signed") &&
                            !line.includes("CpiContext")
                        ) {
                            const context = lines
                                .slice(Math.max(0, i - 5), Math.min(lines.length, i + 5))
                                .join("\n");
                            if (!context.includes("program_id") && !context.includes("Program<")) {
                                findings.push({
                                    severity: "critical",
                                    title: "CPI invocation without program ID verification",
                                    location: { file: "program.rs", line: i + 1 },
                                    description:
                                        "A cross-program invocation (CPI) is performed without verifying the target program's ID. An attacker could substitute a malicious program.",
                                    recommendation:
                                        "Use typed Program<'info, T> accounts and CpiContext for all CPI calls to ensure program ID verification.",
                                    pattern: "insecure-cpi",
                                });
                            }
                        }
                    }

                    return findings;
                },
            },
            {
                pattern: "close-account-drain",
                check: (source: string): Finding[] => {
                    const findings: Finding[] = [];
                    const lines = source.split("\n");

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        if (line.includes("close") && line.includes("fn")) {
                            const closeBlock = lines.slice(i, Math.min(lines.length, i + 30)).join("\n");
                            if (
                                !closeBlock.includes("sol_memset") &&
                                !closeBlock.includes("close =") &&
                                !closeBlock.includes("0u8") &&
                                closeBlock.includes("lamports")
                            ) {
                                findings.push({
                                    severity: "high",
                                    title: "Account close without data zeroing",
                                    location: { file: "program.rs", line: i + 1, instruction: "close" },
                                    description:
                                        "The close instruction transfers lamports but does not zero the account data. Stale data remains readable and could be used in replay attacks.",
                                    recommendation:
                                        "Zero all account data bytes after transferring lamports, or use Anchor's close = constraint.",
                                    pattern: "close-account-drain",
                                });
                            }
                        }
                    }

                    return findings;
                },
            },
            {
                pattern: "owner-check",
                check: (source: string): Finding[] => {
                    const findings: Finding[] = [];
                    const lines = source.split("\n");

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        if (
                            line.includes("AccountInfo") &&
                            line.includes("pub") &&
                            !line.includes("///")
                        ) {
                            const context = lines
                                .slice(Math.max(0, i - 10), Math.min(lines.length, i + 3))
                                .join("\n");
                            if (
                                !context.includes("owner") &&
                                !context.includes("has_one") &&
                                !context.includes("constraint") &&
                                !context.includes("Program<") &&
                                !context.includes("Signer<") &&
                                !context.includes("SystemAccount<")
                            ) {
                                findings.push({
                                    severity: "high",
                                    title: "Missing owner check on account",
                                    location: { file: "program.rs", line: i + 1 },
                                    description:
                                        "An account is accessed via raw AccountInfo without verifying its owner program. An attacker could pass an account owned by a different program with crafted data.",
                                    recommendation:
                                        "Use typed Account<'info, T> wrappers which automatically verify the owner, or add explicit owner checks.",
                                    pattern: "owner-check",
                                });
                            }
                        }
                    }

                    return findings;
                },
            },
        ];
    }

    private checkBestPractices(source: string, framework: string): Finding[] {
        const findings: Finding[] = [];
        const lines = source.split("\n");

        if (framework === "anchor" && !source.includes("InitSpace")) {
            findings.push({
                severity: "info",