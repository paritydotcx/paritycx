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