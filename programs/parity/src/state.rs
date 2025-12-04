use anchor_lang::prelude::*;

pub const MAX_SKILL_NAME_LEN: usize = 64;
pub const MAX_SKILL_VERSION_LEN: usize = 16;
pub const MAX_SKILL_DESC_LEN: usize = 256;
pub const MAX_METADATA_URI_LEN: usize = 200;
pub const MAX_CREDENTIALS_URI_LEN: usize = 200;
pub const MAX_AUDITOR_NAME_LEN: usize = 64;
pub const MAX_PATTERN_ID_LEN: usize = 64;
pub const MAX_PATTERN_DESC_LEN: usize = 256;
pub const MAX_DETECTION_RULE_LEN: usize = 512;
pub const MAX_SKILLS_PER_ANALYSIS: usize = 8;

#[account]
#[derive(InitSpace)]
pub struct Registry {
    pub authority: Pubkey,
    pub total_programs: u64,
    pub total_analyses: u64,
    pub total_skills: u64,
    pub total_auditors: u64,
    pub total_patterns: u64,
    pub min_score_for_badge: u8,
    pub analysis_fee_lamports: u64,
    pub is_paused: bool,
    pub bump: u8,
    pub created_at: i64,
    pub updated_at: i64,
}

#[account]
#[derive(InitSpace)]
pub struct ProgramEntry {
    pub owner: Pubkey,
    pub program_hash: [u8; 32],
    pub framework: Framework,
    #[max_len(200)]
    pub metadata_uri: String,
    pub registered_at: i64,
    pub updated_at: i64,
    pub analysis_count: u32,
    pub latest_score: u8,
    pub is_verified: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct AnalysisReport {
    pub program_entry: Pubkey,
    pub auditor: Pubkey,
    pub score: u8,
    pub findings_hash: [u8; 32],
    #[max_len(8, 64)]
    pub skills_used: Vec<String>,
    pub findings_count: AnalysisFindingsCount,
    pub submitted_at: i64,
    pub updated_at: i64,
    pub version: u8,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace, PartialEq)]
pub struct AnalysisFindingsCount {
    pub critical: u16,
    pub high: u16,
    pub medium: u16,
    pub info: u16,
    pub pass: u16,
    pub total: u16,
}

#[account]
#[derive(InitSpace)]
pub struct SkillEntry {
    pub authority: Pubkey,
    #[max_len(64)]