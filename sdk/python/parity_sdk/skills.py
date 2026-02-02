from __future__ import annotations

import httpx

from parity_sdk.types import SkillDefinition, SkillInput, SkillOutput
from parity_sdk.constants import ENDPOINTS, SKILL_NAMES


class SkillsApi:
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