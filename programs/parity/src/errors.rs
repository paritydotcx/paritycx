use anchor_lang::prelude::*;

#[error_code]
pub enum ParityError {
    #[msg("Analysis score must be between 0 and 100")]
    InvalidScore,

    #[msg("Program hash has already been registered")]
    ProgramAlreadyRegistered,

    #[msg("Analysis has already been submitted for this program")]
    AnalysisAlreadyExists,

    #[msg("Skill name exceeds maximum length of 64 characters")]
    SkillNameTooLong,

    #[msg("Skill version exceeds maximum length of 16 characters")]
    SkillVersionTooLong,

    #[msg("Skill description exceeds maximum length of 256 characters")]
    SkillDescriptionTooLong,

    #[msg("Maximum number of skills per analysis exceeded")]
    TooManySkills,

    #[msg("Metadata URI exceeds maximum length of 200 characters")]
    MetadataUriTooLong,

    #[msg("Auditor is not authorized to submit analyses")]
    UnauthorizedAuditor,

    #[msg("Auditor account is currently inactive")]
    AuditorInactive,

    #[msg("Verification badge has expired")]
    BadgeExpired,

    #[msg("Verification badge has already been revoked")]
    BadgeAlreadyRevoked,
