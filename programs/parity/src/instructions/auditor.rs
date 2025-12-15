use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ParityError;

pub fn register_auditor(
    ctx: Context<RegisterAuditor>,
    name: String,
    credentials_uri: String,
) -> Result<()> {
    require!(
        name.len() <= MAX_AUDITOR_NAME_LEN,
        ParityError::AuditorNameTooLong
    );
    require!(
        credentials_uri.len() <= MAX_CREDENTIALS_URI_LEN,
        ParityError::CredentialsUriTooLong
    );

    let auditor = &mut ctx.accounts.auditor_account;
    let registry = &mut ctx.accounts.registry;
    let clock = Clock::get()?;

    auditor.authority = ctx.accounts.authority.key();
    auditor.name = name.clone();
    auditor.credentials_uri = credentials_uri;
    auditor.total_analyses = 0;
    auditor.average_score = 0;
    auditor.is_active = true;
    auditor.registered_at = clock.unix_timestamp;
    auditor.updated_at = clock.unix_timestamp;
    auditor.bump = ctx.bumps.auditor_account;

    registry.total_auditors = registry.total_auditors.checked_add(1).unwrap();
    registry.updated_at = clock.unix_timestamp;

    msg!("Auditor registered: {}", name);
    Ok(())
}

pub fn update_auditor_status(
    ctx: Context<UpdateAuditorStatus>,
    is_active: bool,
) -> Result<()> {
    let auditor = &mut ctx.accounts.auditor_account;
    let clock = Clock::get()?;

    auditor.is_active = is_active;
    auditor.updated_at = clock.unix_timestamp;

    msg!(
        "Auditor {} status updated: active={}",