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
        description: "Close account instruction does not properly drain lamports and zero data",
        detectionHint: "Check close = target constraint or manual data zeroing",
    },
    {
        id: "type-cosplay",
        severity: "critical",
        patternType: "type-cosplay",
        description: "Account can be substituted with a different type due to missing discriminator",
        detectionHint: "Ensure all accounts use Anchor discriminators via Account<> wrapper",
    },
    {
        id: "reinitialization-attack",
        severity: "critical",
        patternType: "reinitialization-attack",
        description: "Account can be re-initialized by calling init instruction multiple times",
        detectionHint: "Use init_if_needed with care or add is_initialized flag checks",
    },
    {
        id: "owner-check",
        severity: "high",
        patternType: "owner-check",
        description: "Account owner is not validated, allowing cross-program account injection",
        detectionHint: "Verify owner field matches expected program ID",
    },
];

const AUDIT_FINDINGS: AuditFinding[] = [
    {
        source: "OtterSec Audit DB",
        vulnerabilityClass: "Access Control",
        severity: "critical",
        description: "Admin functions callable by any signer due to missing authority validation",
        fixPattern: "Add has_one = authority constraint to admin instruction accounts",
    },
    {
        source: "Sec3 Auto-Audit",
        vulnerabilityClass: "Integer Overflow",
        severity: "high",
        description: "Token amount calculation overflows on large deposits",
        fixPattern: "Replace arithmetic operators with checked_mul and checked_div",
    },
    {
        source: "Neodyme Research",
        vulnerabilityClass: "PDA Validation",
        severity: "critical",
        description: "Vault PDA seeds include user-supplied string without length validation",
        fixPattern: "Limit seed input length and use canonical bump in derivation",
    },
    {
        source: "OtterSec Audit DB",
        vulnerabilityClass: "CPI Safety",
        severity: "critical",
        description: "Token program invocation uses unchecked AccountInfo",
        fixPattern: "Use Program<'info, Token> and CpiContext for all CPI calls",
    },
    {
        source: "Sec3 Auto-Audit",
        vulnerabilityClass: "State Management",
        severity: "high",
        description: "Protocol state account not validated in governance instruction",
        fixPattern: "Add seeds and bump constraints with has_one for state references",
    },
    {
        source: "Neodyme Research",
        vulnerabilityClass: "Reentrancy",
        severity: "critical",
        description: "State update occurs after CPI call allowing reentrancy via callback",
        fixPattern: "Follow checks-effects-interactions pattern: update state before CPI",
    },
    {
        source: "OtterSec Audit DB",
        vulnerabilityClass: "Close Account",
        severity: "high",
        description: "Account close does not zero data, leaving stale data readable",
        fixPattern: "Zero all account data bytes after transferring lamports on close",
    },
    {
        source: "Sec3 Auto-Audit",
        vulnerabilityClass: "Signer Verification",
        severity: "critical",
        description: "Multisig threshold check uses >= instead of > allowing bypass",
        fixPattern: "Ensure threshold comparison matches intended quorum logic",
    },
];