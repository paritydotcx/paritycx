from __future__ import annotations

import httpx

from parity_sdk.types import SkillDefinition, SkillInput, SkillOutput
from parity_sdk.constants import ENDPOINTS, SKILL_NAMES


class SkillsApi:  # Query, cache, and resolve analysis skill definitions
    """Interface for querying and managing analysis skills."""

    def __init__(self, http: httpx.Client) -> None:
        self._http = http
        self._cache: dict[str, SkillDefinition] = {}

    def list(self) -> list[SkillDefinition]:
        """List all available skills."""
        response = self._http.get(ENDPOINTS["skills"])
        response.raise_for_status()
        skills_data = response.json()

        skills: list[SkillDefinition] = []
        for raw in skills_data:
            skill = self._parse_skill(raw)
            self._cache[skill.name] = skill
            skills.append(skill)

        return skills

    def get(self, name: str) -> SkillDefinition:
        """Get a specific skill by name."""
        cached = self._cache.get(name)
        if cached is not None:
            return cached

        response = self._http.get(f"{ENDPOINTS['skills']}/{name}")
        response.raise_for_status()
        skill = self._parse_skill(response.json())
        self._cache[name] = skill
        return skill

    def validate(self, name: str) -> bool:
        """Check if a skill name is valid."""
        valid_names = set(SKILL_NAMES.values())
        if name in valid_names:
            return True

        try:
            self.get(name)
            return True
        except httpx.HTTPStatusError:
            return False

    def get_chain(self, skill_name: str) -> list[str]:
        """Get the execution chain for a skill."""
        if skill_name == SKILL_NAMES["DEEP_AUDIT"]: