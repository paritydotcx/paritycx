interface StaticRule {
    id: string;
    severity: string;
    patternType: string;
    description: string;
    detectionHint: string;
}

interface AuditFinding {
    source: string;
    vulnerabilityClass: string;
    severity: string;
    description: string;
    fixPattern: string;
}

interface FrameworkPattern {
    framework: string;
    patternName: string;
    description: string;
    exampleCode: string;
}

interface ContextQuery {
    pattern?: string;
    framework?: string;
    severity?: string;
    patternType?: string;
}

interface ContextResult {
    rules: StaticRule[];
    auditFindings: AuditFinding[];
    frameworkPatterns: FrameworkPattern[];
}

const STATIC_RULES: StaticRule[] = [
    {
        id: "missing-signer-check",
        severity: "critical",
        patternType: "missing-signer-check",
        description: "Instruction does not verify that the authority account has signed the transaction",
        detectionHint: "Check for Signer<'info> constraint on authority accounts",
    },
    {
        id: "unchecked-arithmetic",
        severity: "high",
        patternType: "unchecked-arithmetic",
        description: "Arithmetic operation may overflow or underflow without checked math",
        detectionHint: "Look for +, -, * operators without checked_add, checked_sub",
    },
    {
        id: "unvalidated-pda",
        severity: "critical",
        patternType: "unvalidated-pda",
        description: "PDA derivation uses attacker-controlled seeds without validation",
        detectionHint: "Verify seeds constraints and bump validation in #[account]",
    },
    {
        id: "insecure-cpi",
        severity: "critical",
        patternType: "insecure-cpi",
        description: "Cross-program invocation does not verify the target program ID",
        detectionHint: "Ensure CPI calls use Program<'info, T> typed accounts",
    },
    {
        id: "account-deserialization",
        severity: "high",
        patternType: "account-deserialization",
        description: "Account data deserialization does not verify discriminator or owner",
        detectionHint: "Use Account<'info, T> instead of AccountInfo for typed deserialization",
    },
    {
        id: "rent-exemption",
        severity: "medium",
        patternType: "rent-exemption",
        description: "Account may not be rent-exempt after initialization",
        detectionHint: "Verify init constraint includes correct space calculation",
    },
    {
        id: "close-account-drain",
        severity: "high",
        patternType: "close-account",