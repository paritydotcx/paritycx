use anchor_lang::prelude::*;
use crate::state::{Severity, PatternType};

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