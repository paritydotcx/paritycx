use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod context_engine;
pub mod skills;

use instructions::*;

declare_id!("PARTYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx1");

#[program]
pub mod parity {
    use super::*;

    pub fn initialize_registry(
        ctx: Context<InitializeRegistry>,
        config: RegistryConfig,
    ) -> Result<()> {
        instructions::registry::initialize_registry(ctx, config)
    }

    pub fn register_program(
        ctx: Context<RegisterProgram>,
        program_hash: [u8; 32],
        framework: Framework,
        metadata_uri: String,
    ) -> Result<()> {
        instructions::registry::register_program(ctx, program_hash, framework, metadata_uri)
    }

    pub fn submit_analysis(
        ctx: Context<SubmitAnalysis>,
        score: u8,
        findings_hash: [u8; 32],
        skills_used: Vec<String>,
        findings_count: AnalysisFindingsCount,
    ) -> Result<()> {
        instructions::analysis::submit_analysis(
            ctx,
            score,
            findings_hash,
            skills_used,
            findings_count,
        )
    }

    pub fn update_analysis(
        ctx: Context<UpdateAnalysis>,
        new_score: u8,
        new_findings_hash: [u8; 32],
        new_findings_count: AnalysisFindingsCount,
    ) -> Result<()> {
        instructions::analysis::update_analysis(
            ctx,
            new_score,
            new_findings_hash,
            new_findings_count,
        )
    }

    pub fn register_skill(
        ctx: Context<RegisterSkill>,
        name: String,
        version: String,
        description: String,
        skill_type: SkillType,
    ) -> Result<()> {
        instructions::skill_registry::register_skill(
            ctx,
            name,
            version,
            description,
            skill_type,
        )
    }

    pub fn update_skill(
        ctx: Context<UpdateSkill>,
        new_version: String,
        new_description: String,
    ) -> Result<()> {
        instructions::skill_registry::update_skill(ctx, new_version, new_description)
    }

    pub fn deprecate_skill(ctx: Context<DeprecateSkill>) -> Result<()> {
        instructions::skill_registry::deprecate_skill(ctx)
    }

    pub fn register_auditor(
        ctx: Context<RegisterAuditor>,
        name: String,
        credentials_uri: String,
    ) -> Result<()> {
        instructions::auditor::register_auditor(ctx, name, credentials_uri)
    }

    pub fn update_auditor_status(
        ctx: Context<UpdateAuditorStatus>,
        is_active: bool,
    ) -> Result<()> {
        instructions::auditor::update_auditor_status(ctx, is_active)
    }

    pub fn create_verification_badge(
        ctx: Context<CreateVerificationBadge>,
        tier: VerificationTier,
        expires_at: i64,
    ) -> Result<()> {
        instructions::badge::create_verification_badge(ctx, tier, expires_at)
    }

    pub fn revoke_verification_badge(ctx: Context<RevokeVerificationBadge>) -> Result<()> {
        instructions::badge::revoke_verification_badge(ctx)
    }

    pub fn submit_context_pattern(
        ctx: Context<SubmitContextPattern>,
        pattern_id: String,
        severity: Severity,
        pattern_type: PatternType,
        description: String,
        detection_rule: String,
    ) -> Result<()> {
        instructions::context::submit_context_pattern(
            ctx,
            pattern_id,