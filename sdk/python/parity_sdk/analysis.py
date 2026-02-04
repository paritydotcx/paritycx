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
                    pattern=f["pattern"],
                )
                for f in data["findings"]
            ],
            summary=data["summary"],
            skills=data["skills"],
            metadata=AnalysisMetadata(
                framework=data["metadata"]["framework"],
                analyzed_at=data["metadata"]["analyzedAt"],
                duration=data["metadata"]["duration"],
                program_id=data["metadata"].get("programId"),
            ),
        )

        if options.min_score is not None and result.score < options.min_score:
            raise AnalysisScoreError(
                f"Analysis score {result.score} is below the minimum threshold {options.min_score}",
                actual_score=result.score,
                min_score=options.min_score,
            )

        if options.fail_on:
            failing = [f for f in result.findings if f.severity in options.fail_on]
            if failing:
                raise AnalysisFindingsError(
                    f"Found {len(failing)} findings with severity: {', '.join(options.fail_on)}",
                    findings=failing,
                )

        return result

    @staticmethod
    def count_findings(findings: list[Finding]) -> AnalysisFindingsCount:
        """Count findings by severity level."""
        count = AnalysisFindingsCount()
        for finding in findings:
            if finding.severity == "critical":
                count.critical += 1
            elif finding.severity == "high":
                count.high += 1
            elif finding.severity == "medium":
                count.medium += 1
            elif finding.severity == "info":
                count.info += 1
            elif finding.severity == "pass":
                count.pass_count += 1
            count.total += 1
        return count

    @staticmethod
    def calculate_score(findings: list[Finding]) -> int:
        """Calculate a security score based on findings."""
        if not findings:
            return 100

        score = 100
        for finding in findings:
            weight = SEVERITY_WEIGHTS.get(finding.severity, 0)
            score = max(0, score - weight)
        return score

    @staticmethod
    def generate_summary(findings: list[Finding], score: int) -> str:
        """Generate a human-readable analysis summary."""
        counts = AnalysisEngine.count_findings(findings)
        parts: list[str] = []

        if counts.critical > 0:
            parts.append(f"{counts.critical} critical")
        if counts.high > 0:
            parts.append(f"{counts.high} high")
        if counts.medium > 0:
            parts.append(f"{counts.medium} medium")
        if counts.info > 0:
            parts.append(f"{counts.info} info")

        if not parts:
            return f"Analysis complete with a perfect score of {score}. No issues found."

        return f"Found {' and '.join(parts)} severity issues. Overall score: {score}/100."

    @staticmethod
    def format_findings_markdown(findings: list[Finding]) -> str:
        """Format findings as a Markdown report."""
        lines: list[str] = ["# Analysis Findings\n"]

        grouped: dict[str, list[Finding]] = {
            "critical": [],
            "high": [],
            "medium": [],
            "info": [],
            "pass": [],
        }

        for finding in findings:
            if finding.severity in grouped:
                grouped[finding.severity].append(finding)

        for severity in ("critical", "high", "medium", "info", "pass"):
            group = grouped[severity]
            if not group:
                continue

            lines.append(f"## {severity.upper()} ({len(group)})\n")

            for finding in group:
                lines.append(f"### {finding.title}")
                lines.append(f"- **Location**: {finding.location.file}:{finding.location.line}")
                if finding.location.instruction:
                    lines.append(f"- **Instruction**: {finding.location.instruction}")