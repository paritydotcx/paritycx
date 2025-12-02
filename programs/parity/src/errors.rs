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

    #[msg("Invalid verification tier for the given score")]
    InvalidTierForScore,

    #[msg("Pattern ID exceeds maximum length of 64 characters")]
    PatternIdTooLong,

    #[msg("Detection rule exceeds maximum length of 512 characters")]
    DetectionRuleTooLong,

    #[msg("Pattern description exceeds maximum length of 256 characters")]
    PatternDescriptionTooLong,

    #[msg("Program is not registered in the registry")]
    ProgramNotRegistered,

    #[msg("Insufficient analysis score for the requested tier")]
    InsufficientScore,

    #[msg("Registry has reached maximum capacity")]
    RegistryFull,