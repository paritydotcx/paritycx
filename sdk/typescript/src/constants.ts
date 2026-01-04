export const DEFAULT_BASE_URL = "https://api.parity.cx";
export const DEFAULT_TIMEOUT = 30_000;
export const DEFAULT_RETRIES = 3;
export const DEFAULT_RETRY_DELAY = 1_000;
export const DEFAULT_SOLANA_RPC = "https://api.devnet.solana.com";

export const API_VERSION = "v1";

export const ENDPOINTS = {
    analyze: `/${API_VERSION}/analyze`,
    skills: `/${API_VERSION}/skills`,
    context: `/${API_VERSION}/context`,
    programs: `/${API_VERSION}/programs`,
    auditors: `/${API_VERSION}/auditors`,
    badges: `/${API_VERSION}/badges`,
    health: `/${API_VERSION}/health`,
} as const;

export const SKILL_NAMES = {
    SECURITY_AUDIT: "security-audit",
    BEST_PRACTICES: "best-practices",
    GAS_OPTIMIZATION: "gas-optimization",
    DEEP_AUDIT: "deep-audit",
} as const;

export const SEVERITY_WEIGHTS: Record<string, number> = {
    critical: 25,
    high: 15,
    medium: 8,
    info: 3,
    pass: 0,
};

export const TIER_THRESHOLDS: Record<string, number> = {
    bronze: 50,
    silver: 70,
    gold: 85,
    platinum: 95,
};

export const MAX_PROGRAM_SIZE = 10 * 1024 * 1024;
export const MAX_SKILLS_PER_ANALYSIS = 8;
export const MAX_RETRIES = 5;

export const SUPPORTED_FRAMEWORKS = ["anchor", "native", "seahorse", "steel"] as const;

export const VULNERABILITY_CATEGORIES = [
    "missing-signer-check",
    "unchecked-arithmetic",
    "unvalidated-pda",
    "insecure-cpi",
    "account-deserialization",
    "rent-exemption",
    "close-account",
    "type-cosplay",
    "reinitialization-attack",
    "owner-check",
] as const;
