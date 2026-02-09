from __future__ import annotations

import re
from pathlib import Path

import yaml

from parity_sdk.types import SkillDefinition, SkillInput, SkillOutput


class SkillParser:
    """Parser and serializer for SKILL.md files."""

    @staticmethod
    def parse(content: str) -> SkillDefinition:
        """Parse a SKILL.md string into a SkillDefinition."""
        frontmatter, body = SkillParser._split_frontmatter(content)
        meta = yaml.safe_load(frontmatter)

        inputs = [
            SkillInput(
                name=inp["name"],
                type=inp["type"],
                required=inp.get("required", False),
                default=inp.get("default"),
            )
            for inp in meta.get("inputs", [])
        ]

        outputs = [
            SkillOutput(name=out["name"], type=out["type"])
            for out in meta.get("outputs", [])
        ]

        steps = SkillParser._extract_steps(body)

        return SkillDefinition(
            name=meta["name"],
            version=meta["version"],
            description=meta["description"],
            inputs=inputs,
            outputs=outputs,
            steps=steps or None,
        )

    @staticmethod
    def parse_file(file_path: str) -> SkillDefinition:
        """Parse a SKILL.md file from disk."""
        path = Path(file_path).resolve()
        content = path.read_text(encoding="utf-8")
        return SkillParser.parse(content)

    @staticmethod
    def serialize(skill: SkillDefinition) -> str:
        """Serialize a SkillDefinition back to SKILL.md format."""
        meta: dict = {
            "name": skill.name,
            "version": skill.version,
            "description": skill.description,
        }

        if skill.inputs:
            meta["inputs"] = [
                {
                    "name": inp.name,
                    "type": inp.type,
                    "required": inp.required,