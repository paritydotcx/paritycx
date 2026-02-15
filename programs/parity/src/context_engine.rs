use anchor_lang::prelude::*;
use crate::state::{Severity, PatternType};

/// A static rule derived from curated audit databases and framework intelligence.
pub struct VulnerabilityRule {
    pub id: &'static str,
    pub severity: Severity,
    pub pattern_type: PatternType,
    pub description: &'static str,
    pub detection_hint: &'static str,
}

pub const VULNERABILITY_RULES: &[VulnerabilityRule] = &[
    VulnerabilityRule {
        id: "missing-signer-check",
        severity: Severity::Critical,
        pattern_type: PatternType::MissingSignerCheck,
        description: "Instruction does not verify that the authority account has signed the transaction",
        detection_hint: "Check for Signer<'info> constraint on authority accounts in #[derive(Accounts)]",
    },
    VulnerabilityRule {
        id: "unchecked-arithmetic",
        severity: Severity::High,
        pattern_type: PatternType::UncheckedArithmetic,
        description: "Arithmetic operation may overflow or underflow without checked math",
        detection_hint: "Look for +, -, * operators without checked_add, checked_sub, checked_mul",
    },
    VulnerabilityRule {
        id: "unvalidated-pda",
        severity: Severity::Critical,
        pattern_type: PatternType::UnvalidatedPda,
        description: "PDA derivation uses attacker-controlled seeds without validation",
        detection_hint: "Verify seeds constraints in #[account] and check for bump validation",
    },
    VulnerabilityRule {
        id: "insecure-cpi",
        severity: Severity::Critical,
        pattern_type: PatternType::InsecureCpi,
        description: "Cross-program invocation does not verify the target program ID",
        detection_hint: "Ensure CPI calls use Program<'info, T> typed accounts",
    },
    VulnerabilityRule {
        id: "account-deserialization",
        severity: Severity::High,
        pattern_type: PatternType::AccountDeserialization,
        description: "Account data deserialization does not verify discriminator or owner",
        detection_hint: "Use Account<'info, T> instead of AccountInfo for typed deserialization",
    },
    VulnerabilityRule {
        id: "rent-exemption",
        severity: Severity::Medium,
        pattern_type: PatternType::RentExemption,
        description: "Account may not be rent-exempt after initialization",
        detection_hint: "Verify init constraint includes correct space calculation",
    },
    VulnerabilityRule {
        id: "close-account-drain",
        severity: Severity::High,
        pattern_type: PatternType::CloseAccount,
        description: "Close account instruction does not properly drain lamports and zero data",
        detection_hint: "Check close = target constraint or manual lamport transfer and data zeroing",
    },
    VulnerabilityRule {
        id: "type-cosplay",
        severity: Severity::Critical,
        pattern_type: PatternType::TypeCosplay,
        description: "Account can be substituted with a different account type due to missing discriminator check",
        detection_hint: "Ensure all accounts use Anchor discriminators via Account<> wrapper",
    },
    VulnerabilityRule {
        id: "reinitialization-attack",
        severity: Severity::Critical,
        pattern_type: PatternType::ReinitiallizationAttack,
        description: "Account can be re-initialized by calling init instruction multiple times",
        detection_hint: "Use init_if_needed with care or add is_initialized flag checks",
    },
    VulnerabilityRule {
        id: "owner-check",
        severity: Severity::High,
        pattern_type: PatternType::OwnerCheck,
        description: "Account owner is not validated, allowing cross-program account injection",
        detection_hint: "Verify owner field matches expected program ID in constraints",
    },
];

pub struct AuditFinding {
    pub source: &'static str,
    pub vulnerability_class: &'static str,
    pub severity: Severity,
    pub description: &'static str,
    pub fix_pattern: &'static str,
}

pub const CURATED_AUDIT_FINDINGS: &[AuditFinding] = &[
    AuditFinding {
        source: "OtterSec Audit DB",
        vulnerability_class: "Access Control",
        severity: Severity::Critical,
        description: "Admin functions callable by any signer due to missing authority validation",
        fix_pattern: "Add has_one = authority constraint to admin instruction accounts",
    },
    AuditFinding {
        source: "Sec3 Auto-Audit",
        vulnerability_class: "Integer Overflow",
        severity: Severity::High,
        description: "Token amount calculation overflows on large deposits",
        fix_pattern: "Replace arithmetic operators with checked_mul and checked_div",
    },
    AuditFinding {
        source: "Neodyme Research",
        vulnerability_class: "PDA Validation",
        severity: Severity::Critical,
        description: "Vault PDA seeds include user-supplied string without length validation",
        fix_pattern: "Limit seed input length and use canonical bump in derivation",
    },
    AuditFinding {
        source: "OtterSec Audit DB",
        vulnerability_class: "CPI Safety",
        severity: Severity::Critical,
        description: "Token program invocation uses unchecked AccountInfo instead of typed Program",
        fix_pattern: "Use Program<'info, Token> and CpiContext for all CPI calls",
    },
    AuditFinding {
        source: "Sec3 Auto-Audit",
        vulnerability_class: "State Management",
        severity: Severity::High,
        description: "Protocol state account not validated in governance instruction",
        fix_pattern: "Add seeds and bump constraints with has_one for state references",
    },
    AuditFinding {
        source: "Neodyme Research",
        vulnerability_class: "Reentrancy",
        severity: Severity::Critical,
        description: "State update occurs after CPI call allowing reentrancy via callback",
        fix_pattern: "Follow checks-effects-interactions pattern: update state before CPI",
    },
    AuditFinding {
        source: "OtterSec Audit DB",
        vulnerability_class: "Close Account",
        severity: Severity::High,
        description: "Account close does not zero data, leaving stale data readable",
        fix_pattern: "Zero all account data bytes after transferring lamports on close",
    },
    AuditFinding {
        source: "Sec3 Auto-Audit",
        vulnerability_class: "Signer Verification",
        severity: Severity::Critical,
        description: "Multisig threshold check uses >= instead of > allowing single-signer bypass",
        fix_pattern: "Ensure threshold comparison matches intended quorum logic",
    },
];

pub struct FrameworkPattern {
    pub framework: &'static str,
    pub pattern_name: &'static str,
    pub description: &'static str,
    pub example_code: &'static str,
}

pub const ANCHOR_PATTERNS: &[FrameworkPattern] = &[
    FrameworkPattern {
        framework: "anchor",
        pattern_name: "account-initialization",
        description: "Correct account initialization with space calculation and PDA seeds",
        example_code: r#"#[account(init, payer = user, space = 8 + MyAccount::INIT_SPACE, seeds = [b"seed", user.key().as_ref()], bump)]"#,
    },
    FrameworkPattern {
        framework: "anchor",
        pattern_name: "pda-derivation",
        description: "Deterministic PDA derivation with canonical bump storage",
        example_code: r#"let (pda, bump) = Pubkey::find_program_address(&[b"vault", owner.as_ref()], program_id);"#,
    },
    FrameworkPattern {
        framework: "anchor",
        pattern_name: "cpi-invocation",
        description: "Safe cross-program invocation using CpiContext and typed program accounts",
        example_code: r#"let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer { from, to, authority });"#,
    },
    FrameworkPattern {
        framework: "anchor",
        pattern_name: "access-control",
        description: "Authority validation using has_one and constraint macros",
        example_code: r#"#[account(mut, has_one = authority, seeds = [b"config"], bump = config.bump)]"#,
    },
    FrameworkPattern {
        framework: "anchor",
        pattern_name: "error-handling",
        description: "Custom error definitions with require! macro for validation",
        example_code: r#"require!(amount > 0, MyError::InvalidAmount);"#,
    },
    FrameworkPattern {
        framework: "anchor",
        pattern_name: "close-account",
        description: "Safe account closure with lamport drain and data zeroing",
        example_code: r#"#[account(mut, close = destination, has_one = authority)]"#,
    },
    FrameworkPattern {
        framework: "anchor",
        pattern_name: "event-emission",
        description: "Structured event emission for off-chain indexing",
        example_code: r#"emit!(TransferEvent { from: ctx.accounts.from.key(), to: ctx.accounts.to.key(), amount });"#,
    },
    FrameworkPattern {
        framework: "anchor",
        pattern_name: "checked-math",
        description: "Overflow-safe arithmetic using checked operations",
        example_code: r#"let result = a.checked_add(b).ok_or(MyError::Overflow)?;"#,
    },
];

pub fn get_rules_for_pattern_type(pattern_type: PatternType) -> Vec<&'static VulnerabilityRule> {
    VULNERABILITY_RULES
        .iter()
        .filter(|rule| rule.pattern_type == pattern_type)
        .collect()
}

pub fn get_findings_by_severity(severity: Severity) -> Vec<&'static AuditFinding> {
    CURATED_AUDIT_FINDINGS
        .iter()
        .filter(|finding| finding.severity == severity)
        .collect()
}

pub fn get_framework_patterns(framework: &str) -> Vec<&'static FrameworkPattern> {
    ANCHOR_PATTERNS
        .iter()
        .filter(|pattern| pattern.framework == framework)
        .collect()
}

pub fn calculate_risk_score(findings: &[&AuditFinding]) -> u8 {
    if findings.is_empty() {
        return 100;
    }

    let mut score: i32 = 100;

    for finding in findings {
        let penalty = match finding.severity {
            Severity::Critical => 25,
            Severity::High => 15,
            Severity::Medium => 8,
            Severity::Info => 3,
            Severity::Pass => 0,
        };
        score = score.saturating_sub(penalty);
    }

    score.max(0) as u8
}
