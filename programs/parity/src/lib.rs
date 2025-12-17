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