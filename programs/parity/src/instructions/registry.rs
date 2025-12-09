use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ParityError;

pub fn initialize_registry(
    ctx: Context<InitializeRegistry>,
    config: RegistryConfig,
) -> Result<()> {
    let registry = &mut ctx.accounts.registry;
    let clock = Clock::get()?;

    registry.authority = ctx.accounts.authority.key();
    registry.total_programs = 0;
    registry.total_analyses = 0;
    registry.total_skills = 0;
    registry.total_auditors = 0;
    registry.total_patterns = 0;
    registry.min_score_for_badge = config.min_score_for_badge;
    registry.analysis_fee_lamports = config.analysis_fee_lamports;
    registry.is_paused = config.is_paused;
    registry.bump = ctx.bumps.registry;
    registry.created_at = clock.unix_timestamp;
    registry.updated_at = clock.unix_timestamp;

    msg!("Registry initialized by {}", ctx.accounts.authority.key());
    Ok(())
}

pub fn register_program(
    ctx: Context<RegisterProgram>,
    program_hash: [u8; 32],
    framework: Framework,
    metadata_uri: String,
) -> Result<()> {
    require!(
        metadata_uri.len() <= MAX_METADATA_URI_LEN,
        ParityError::MetadataUriTooLong
    );

    let program_entry = &mut ctx.accounts.program_entry;
    let registry = &mut ctx.accounts.registry;