export interface ParityConfig {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    solanaRpcUrl?: string;
    cluster?: SolanaCluster;
}

export type SolanaCluster = "mainnet-beta" | "devnet" | "testnet" | "localnet";

export type FindingSeverity = "critical" | "high" | "medium" | "info" | "pass";

export type Framework = "anchor" | "native" | "seahorse" | "steel";

export type SkillType =
    | "security-audit"
    | "best-practices"
    | "gas-optimization"
    | "deep-audit"
    | "custom";

export type VerificationTier = "bronze" | "silver" | "gold" | "platinum";

export type OutputFormat = "json" | "sarif" | "markdown" | "text";

export type PatternType =
    | "missing-signer-check"
    | "unchecked-arithmetic"
    | "unvalidated-pda"
    | "insecure-cpi"
    | "account-deserialization"
    | "rent-exemption"
    | "close-account"
    | "type-cosplay"
    | "reinitialization-attack"
    | "owner-check"
    | "custom";

export interface AnalyzeOptions {
    program: string;
    framework?: Framework;
    skills?: string[];
    output?: OutputFormat;
    minScore?: number;
    failOn?: FindingSeverity[];
}

export interface AnalysisResult {
    score: number;
    findings: Finding[];
    summary: string;
    skills: string[];
    metadata: AnalysisMetadata;
}
