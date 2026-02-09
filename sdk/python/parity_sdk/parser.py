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
                    **({"default": inp.default} if inp.default else {}),
                }
                for inp in skill.inputs
            ]

        if skill.outputs:
            meta["outputs"] = [
                {"name": out.name, "type": out.type}
                for out in skill.outputs
            ]

        yaml_str = yaml.dump(meta, default_flow_style=False, sort_keys=False)

        body_lines = [f"# {skill.name}", "", skill.description, ""]

        if skill.steps:
            body_lines.append("## Steps")
            for i, step in enumerate(skill.steps, 1):
                body_lines.append(f"{i}. {step}")

        body = "\n".join(body_lines)

        return f"---\n{yaml_str}---\n\n{body}\n"

    @staticmethod
    def validate(content: str) -> tuple[bool, list[str]]:
        """Validate SKILL.md content and return errors if any."""
        errors: list[str] = []

        try:
            frontmatter, _body = SkillParser._split_frontmatter(content)
            meta = yaml.safe_load(frontmatter)

            if not meta.get("name"):
                errors.append("Missing required field: name")
            if not meta.get("version"):
                errors.append("Missing required field: version")
            if not meta.get("description"):
                errors.append("Missing required field: description")

            name = meta.get("name", "")
            if name and len(name) > 64:
                errors.append("Skill name exceeds 64 characters")

            version = meta.get("version", "")
            if version and not re.match(r"^\d+\.\d+\.\d+$", version):
                errors.append("Version must follow semver format (x.y.z)")

            for inp in meta.get("inputs", []):
                if not inp.get("name"):