use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ParityError;

pub fn submit_context_pattern(
    ctx: Context<SubmitContextPattern>,
    pattern_id: String,
    severity: Severity,
    pattern_type: PatternType,
    description: String,
    detection_rule: String,
) -> Result<()> {
    require!(
        pattern_id.len() <= MAX_PATTERN_ID_LEN,
        ParityError::PatternIdTooLong
    );
    require!(
        description.len() <= MAX_PATTERN_DESC_LEN,
        ParityError::PatternDescriptionTooLong
    );
    require!(
        detection_rule.len() <= MAX_DETECTION_RULE_LEN,
        ParityError::DetectionRuleTooLong
    );

    let pattern = &mut ctx.accounts.context_pattern;
    let registry = &mut ctx.accounts.registry;
    let clock = Clock::get()?;

    pattern.submitter = ctx.accounts.submitter.key();
    pattern.pattern_id = pattern_id.clone();
    pattern.severity = severity;
    pattern.pattern_type = pattern_type;
    pattern.description = description;
    pattern.detection_rule = detection_rule;
    pattern.usage_count = 0;
    pattern.submitted_at = clock.unix_timestamp;
    pattern.updated_at = clock.unix_timestamp;
    pattern.is_active = true;
    pattern.bump = ctx.bumps.context_pattern;

    registry.total_patterns = registry.total_patterns.checked_add(1).unwrap();
    registry.updated_at = clock.unix_timestamp;

    msg!("Context pattern submitted: {}", pattern_id);
    Ok(())
}

#[derive(Accounts)]
#[instruction(pattern_id: String)]
pub struct SubmitContextPattern<'info> {
    #[account(mut)]
    pub submitter: Signer<'info>,

    #[account(
        mut,
        seeds = [b"registry"],
        bump = registry.bump
    )]
    pub registry: Account<'info, Registry>,

    #[account(
        init,
        payer = submitter,
        space = 8 + ContextPattern::INIT_SPACE,
        seeds = [b"pattern", pattern_id.as_bytes()],
        bump
    )]
    pub context_pattern: Account<'info, ContextPattern>,

    pub system_program: Program<'info, System>,
}
