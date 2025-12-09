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
    let clock = Clock::get()?;

    program_entry.owner = ctx.accounts.owner.key();
    program_entry.program_hash = program_hash;
    program_entry.framework = framework;
    program_entry.metadata_uri = metadata_uri;
    program_entry.registered_at = clock.unix_timestamp;
    program_entry.updated_at = clock.unix_timestamp;
    program_entry.analysis_count = 0;
    program_entry.latest_score = 0;
    program_entry.is_verified = false;
    program_entry.bump = ctx.bumps.program_entry;

    registry.total_programs = registry.total_programs.checked_add(1).unwrap();
    registry.updated_at = clock.unix_timestamp;

    msg!(
        "Program registered: hash={:?}, framework={:?}",
        &program_hash[..8],
        framework
    );
    Ok(())
}

pub fn update_registry_config(
    ctx: Context<UpdateRegistryConfig>,
    new_config: RegistryConfig,
) -> Result<()> {
    let registry = &mut ctx.accounts.registry;
    let clock = Clock::get()?;

    registry.min_score_for_badge = new_config.min_score_for_badge;
    registry.analysis_fee_lamports = new_config.analysis_fee_lamports;
    registry.is_paused = new_config.is_paused;
    registry.updated_at = clock.unix_timestamp;

    msg!("Registry config updated by {}", ctx.accounts.authority.key());
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Registry::INIT_SPACE,
        seeds = [b"registry"],
        bump
    )]
    pub registry: Account<'info, Registry>,

    pub system_program: Program<'info, System>,