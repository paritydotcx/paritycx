interface SkillDefinition {
    name: string;
    version: string;
    description: string;
    type: string;
    inputs: Array<{ name: string; type: string; required: boolean; default?: string }>;
    outputs: Array<{ name: string; type: string }>;
    steps: string[];
}

const BUILTIN_SKILLS: SkillDefinition[] = [
    {
        name: "security-audit",
        version: "1.0.0",
        description:
            "Comprehensive Solana program security analysis covering signer checks, arithmetic safety, PDA validation, CPI security, and account constraints",
        type: "security",
        inputs: [
            { name: "program", type: "file", required: true },
            { name: "framework", type: "string", required: false, default: "anchor" },
        ],
        outputs: [
            { name: "findings", type: "Finding[]" },
            { name: "score", type: "number" },
        ],
        steps: [
            "Parse the program source and resolve all account structures",
            "Check for missing signer validations on privileged instructions",
            "Verify arithmetic operations use checked math or overflow protection",
            "Validate CPI calls have correct program ID checks",
            "Ensure PDA seeds are deterministic and not attacker-controlled",
            "Check account constraints (has_one, constraint, seeds)",
            "Verify close account logic drains lamports and zeros data",
            "Score the program 0-100 based on finding severity",
        ],
    },
    {
        name: "best-practices",
        version: "1.0.0",
        description:
            "Solana and Anchor best practices analysis covering code organization, error handling, event emission, and documentation",
        type: "quality",
        inputs: [
            { name: "program", type: "file", required: true },
            { name: "framework", type: "string", required: false, default: "anchor" },
        ],
        outputs: [
            { name: "findings", type: "Finding[]" },
            { name: "score", type: "number" },
        ],
        steps: [
            "Verify program uses InitSpace derive for automatic space calculation",
            "Check error definitions provide descriptive messages",
            "Validate event emissions for critical state changes",
            "Ensure account constraints use typed wrappers over raw AccountInfo",
            "Verify instruction handlers follow single-responsibility principle",
            "Check for proper use of msg! logging in instruction handlers",
        ],
    },
    {
        name: "gas-optimization",
        version: "1.0.0",
        description:
            "Compute unit optimization analysis for Solana programs targeting reduced transaction costs and improved throughput",
        type: "optimization",
        inputs: [
            { name: "program", type: "file", required: true },
            { name: "framework", type: "string", required: false, default: "anchor" },
        ],