use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ParityError;

pub fn submit_analysis(
    ctx: Context<SubmitAnalysis>,
    score: u8,
    findings_hash: [u8; 32],
    skills_used: Vec<String>,
    findings_count: AnalysisFindingsCount,
) -> Result<()> {
    require!(score <= 100, ParityError::InvalidScore);
    require!(
        skills_used.len() <= MAX_SKILLS_PER_ANALYSIS,
        ParityError::TooManySkills
    );

    for skill_name in &skills_used {
        require!(
            skill_name.len() <= MAX_SKILL_NAME_LEN,
            ParityError::SkillNameTooLong
        );
    }

    let expected_total = findings_count
        .critical
        .checked_add(findings_count.high)
        .and_then(|v| v.checked_add(findings_count.medium))
        .and_then(|v| v.checked_add(findings_count.info))
        .and_then(|v| v.checked_add(findings_count.pass))
        .unwrap();
    require!(
        findings_count.total == expected_total,
        ParityError::FindingsCountMismatch
    );

    let auditor_account = &ctx.accounts.auditor_account;
    require!(auditor_account.is_active, ParityError::AuditorInactive);

    let analysis = &mut ctx.accounts.analysis_report;
    let program_entry = &mut ctx.accounts.program_entry;
    let registry = &mut ctx.accounts.registry;
    let clock = Clock::get()?;

    analysis.program_entry = program_entry.key();
    analysis.auditor = ctx.accounts.auditor.key();
    analysis.score = score;
    analysis.findings_hash = findings_hash;
    analysis.skills_used = skills_used;
    analysis.findings_count = findings_count;
    analysis.submitted_at = clock.unix_timestamp;
    analysis.updated_at = clock.unix_timestamp;
    analysis.version = 1;
    analysis.bump = ctx.bumps.analysis_report;

    program_entry.analysis_count = program_entry
        .analysis_count
        .checked_add(1)
        .unwrap();
    program_entry.latest_score = score;
    program_entry.updated_at = clock.unix_timestamp;

    if score >= registry.min_score_for_badge {
        program_entry.is_verified = true;
    }

    registry.total_analyses = registry.total_analyses.checked_add(1).unwrap();
    registry.updated_at = clock.unix_timestamp;

    msg!(
        "Analysis submitted: score={}, findings={}, skills={:?}",
        score,
        findings_count.total,
        analysis.skills_used.len()
    );
    Ok(())
}

pub fn update_analysis(
    ctx: Context<UpdateAnalysis>,