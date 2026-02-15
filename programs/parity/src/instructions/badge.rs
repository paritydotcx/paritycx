use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ParityError;

/// Issues a tiered badge if the latest analysis meets the score threshold.
pub fn create_verification_badge(
    ctx: Context<CreateVerificationBadge>,
    tier: VerificationTier,
    expires_at: i64,
) -> Result<()> {
    let program_entry = &ctx.accounts.program_entry;
    let clock = Clock::get()?;

    let min_score = match tier {
        VerificationTier::Bronze => 50,
        VerificationTier::Silver => 70,
        VerificationTier::Gold => 85,
        VerificationTier::Platinum => 95,
    };

    require!(
        program_entry.latest_score >= min_score,
        ParityError::InsufficientScore
    );

    require!(
        expires_at > clock.unix_timestamp,
        ParityError::BadgeExpired
    );

    let badge = &mut ctx.accounts.verification_badge;

    badge.program_entry = program_entry.key();
    badge.issuer = ctx.accounts.authority.key();
    badge.tier = tier;
    badge.score_at_issuance = program_entry.latest_score;
    badge.issued_at = clock.unix_timestamp;
    badge.expires_at = expires_at;
    badge.is_revoked = false;
    badge.bump = ctx.bumps.verification_badge;

    msg!(
        "Verification badge created: tier={:?}, score={}, expires={}",
        tier,
        program_entry.latest_score,
        expires_at
    );
    Ok(())
}

pub fn revoke_verification_badge(ctx: Context<RevokeVerificationBadge>) -> Result<()> {
    let badge = &mut ctx.accounts.verification_badge;

    require!(!badge.is_revoked, ParityError::BadgeAlreadyRevoked);

    badge.is_revoked = true;

    msg!("Verification badge revoked for program {}", badge.program_entry);
    Ok(())
}

#[derive(Accounts)]
pub struct CreateVerificationBadge<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"registry"],
        bump = registry.bump,
        constraint = authority.key() == registry.authority @ ParityError::UnauthorizedAuditor
    )]
    pub registry: Account<'info, Registry>,

    #[account(
        seeds = [b"program", program_entry.program_hash.as_ref()],
        bump = program_entry.bump,
        constraint = program_entry.is_verified @ ParityError::ProgramNotRegistered
    )]
    pub program_entry: Account<'info, ProgramEntry>,

    #[account(
        init,
        payer = authority,
        space = 8 + VerificationBadge::INIT_SPACE,
        seeds = [b"badge", program_entry.key().as_ref()],
        bump
    )]
    pub verification_badge: Account<'info, VerificationBadge>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeVerificationBadge<'info> {
    #[account(
        constraint = authority.key() == registry.authority @ ParityError::UnauthorizedAuditor
    )]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"registry"],
        bump = registry.bump
    )]
    pub registry: Account<'info, Registry>,

    #[account(
        mut,
        seeds = [b"badge", verification_badge.program_entry.as_ref()],
        bump = verification_badge.bump
    )]
    pub verification_badge: Account<'info, VerificationBadge>,
}
