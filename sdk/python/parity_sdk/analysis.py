from __future__ import annotations

import os
from pathlib import Path

import httpx

from parity_sdk.types import (
    AnalyzeOptions,
    AnalysisResult,
    AnalysisMetadata,
    Finding,
    FindingLocation,
    AnalysisFindingsCount,
)
from parity_sdk.constants import (
    ENDPOINTS,
    SKILL_NAMES,
    SEVERITY_WEIGHTS,
    MAX_PROGRAM_SIZE,
    MAX_SKILLS_PER_ANALYSIS,
)
from parity_sdk.skills import SkillsApi
from parity_sdk.context import ContextApi


class AnalysisEngine:
    """Core analysis engine that orchestrates program verification."""

    def __init__(
        self,
        http: httpx.Client,
        skills: SkillsApi,
        context: ContextApi,
    ) -> None:
        self._http = http
        self._skills = skills
        self._context = context

    def analyze(self, options: AnalyzeOptions) -> AnalysisResult:
        """Analyze a Solana program with the specified skills."""
        self._validate_options(options)

        program_source = self._read_program_source(options.program)
        resolved_skills = options.skills or [SKILL_NAMES["SECURITY_AUDIT"]]
        framework = options.framework or self._detect_framework(program_source)

        response = self._http.post(
            ENDPOINTS["analyze"],
            json={
                "program": program_source,
                "framework": framework,
                "skills": resolved_skills,
                "output": options.output or "json",
            },
        )
        response.raise_for_status()
        data = response.json()

        result = AnalysisResult(
            score=data["score"],
            findings=[
                Finding(
                    severity=f["severity"],
                    title=f["title"],
                    location=FindingLocation(
                        file=f["location"]["file"],
                        line=f["location"]["line"],
                        instruction=f["location"].get("instruction"),
                    ),
                    description=f["description"],
                    recommendation=f["recommendation"],