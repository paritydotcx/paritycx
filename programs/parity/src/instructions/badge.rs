use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ParityError;

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
