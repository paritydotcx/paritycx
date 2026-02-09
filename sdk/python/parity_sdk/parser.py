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
                    errors.append("Input missing name")
                if not inp.get("type"):
                    errors.append(f"Input '{inp.get('name', '?')}' missing type")

            for out in meta.get("outputs", []):
                if not out.get("name"):
                    errors.append("Output missing name")
                if not out.get("type"):
                    errors.append(f"Output '{out.get('name', '?')}' missing type")

        except Exception as exc:
            errors.append(f"Parse error: {exc}")

        return (len(errors) == 0, errors)

    @staticmethod
    def _split_frontmatter(content: str) -> tuple[str, str]:
        trimmed = content.strip()
        if not trimmed.startswith("---"):
            raise ValueError("SKILL.md must start with YAML frontmatter (---)")

        end_idx = trimmed.index("---", 3)
        if end_idx == -1:
            raise ValueError("SKILL.md frontmatter missing closing ---")

        frontmatter = trimmed[3:end_idx].strip()
        body = trimmed[end_idx + 3:].strip()
        return frontmatter, body

    @staticmethod
    def _extract_steps(body: str) -> list[str]:
        steps: list[str] = []
        lines = body.split("\n")
        in_steps = False

        for line in lines:
            lower = line.lower().strip()
            if "## steps" in lower or "## analysis steps" in lower:
                in_steps = True
                continue

            if in_steps and line.startswith("## "):
                break

            if in_steps:
                match = re.match(r"^\d+\.\s+(.+)", line)
                if match:
                    steps.append(match.group(1).strip())

        return steps
