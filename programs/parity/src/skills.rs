use crate::state::SkillType;

pub struct SkillDefinition {
    pub name: &'static str,
    pub version: &'static str,
    pub description: &'static str,
    pub skill_type: SkillType,
    pub steps: &'static [&'static str],
    pub inputs: &'static [SkillInput],
    pub outputs: &'static [SkillOutput],
}

pub struct SkillInput {
    pub name: &'static str,
    pub input_type: &'static str,
    pub required: bool,
    pub default_value: Option<&'static str>,
}

pub struct SkillOutput {
    pub name: &'static str,
    pub output_type: &'static str,
}

pub const BUILTIN_SKILLS: &[SkillDefinition] = &[
    SkillDefinition {
        name: "security-audit",
        version: "1.0.0",
        description: "Comprehensive Solana program security analysis covering signer checks, arithmetic safety, PDA validation, CPI security, and account constraints",
        skill_type: SkillType::SecurityAudit,
        steps: &[
            "Parse the program source and resolve all account structures",
            "Check for missing signer validations on privileged instructions",
            "Verify arithmetic operations use checked math or overflow protection",
            "Validate CPI calls have correct program ID checks",
            "Ensure PDA seeds are deterministic and not attacker-controlled",
            "Check account constraints (has_one, constraint, seeds)",
            "Verify close account logic drains lamports and zeros data",
            "Score the program 0-100 based on finding severity",
        ],
        inputs: &[
            SkillInput {
                name: "program",
                input_type: "file",
                required: true,
                default_value: None,
            },
            SkillInput {
                name: "framework",
                input_type: "string",
                required: false,
                default_value: Some("anchor"),
            },
        ],
        outputs: &[
            SkillOutput {
                name: "findings",
                output_type: "Finding[]",
            },
            SkillOutput {
                name: "score",
                output_type: "number",
            },
        ],
    },
    SkillDefinition {
        name: "best-practices",
        version: "1.0.0",
        description: "Solana and Anchor best practices analysis covering code organization, error handling, event emission, and documentation",
        skill_type: SkillType::BestPractices,
        steps: &[
            "Verify program uses InitSpace derive for automatic space calculation",
            "Check error definitions provide descriptive messages",
            "Validate event emissions for critical state changes",
            "Ensure account constraints use typed wrappers over raw AccountInfo",
            "Verify instruction handlers follow single-responsibility principle",
            "Check for proper use of msg! logging in instruction handlers",
        ],
        inputs: &[
            SkillInput {
                name: "program",
                input_type: "file",
                required: true,
                default_value: None,
            },
            SkillInput {
                name: "framework",
                input_type: "string",
                required: false,
                default_value: Some("anchor"),
            },
        ],
        outputs: &[
            SkillOutput {
                name: "findings",
                output_type: "Finding[]",
            },
            SkillOutput {
                name: "score",
                output_type: "number",