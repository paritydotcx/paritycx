use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ParityError;

pub fn register_skill(
    ctx: Context<RegisterSkill>,
    name: String,
    version: String,
    description: String,
    skill_type: SkillType,
) -> Result<()> {
    require!(name.len() <= MAX_SKILL_NAME_LEN, ParityError::SkillNameTooLong);
    require!(
        version.len() <= MAX_SKILL_VERSION_LEN,
        ParityError::SkillVersionTooLong
    );
    require!(
        description.len() <= MAX_SKILL_DESC_LEN,
        ParityError::SkillDescriptionTooLong
    );

    let skill = &mut ctx.accounts.skill_entry;
    let registry = &mut ctx.accounts.registry;
    let clock = Clock::get()?;

    skill.authority = ctx.accounts.authority.key();
    skill.name = name.clone();
    skill.version = version;
    skill.description = description;
    skill.skill_type = skill_type;
    skill.usage_count = 0;
    skill.is_deprecated = false;
    skill.registered_at = clock.unix_timestamp;
    skill.updated_at = clock.unix_timestamp;
    skill.bump = ctx.bumps.skill_entry;

    registry.total_skills = registry.total_skills.checked_add(1).unwrap();
    registry.updated_at = clock.unix_timestamp;

    msg!("Skill registered: {}", name);
    Ok(())
}

pub fn update_skill(
    ctx: Context<UpdateSkill>,
    new_version: String,
    new_description: String,
) -> Result<()> {
    let skill = &mut ctx.accounts.skill_entry;
    let clock = Clock::get()?;

    require!(!skill.is_deprecated, ParityError::CannotUpdateDeprecatedSkill);
    require!(
        new_version.len() <= MAX_SKILL_VERSION_LEN,