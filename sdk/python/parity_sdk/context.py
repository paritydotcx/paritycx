from __future__ import annotations

import httpx

from parity_sdk.types import (
    ContextQuery,
    ContextResult,
    StaticRule,
    AuditFindingEntry,
    FrameworkPatternEntry,
)
from parity_sdk.constants import ENDPOINTS, SEVERITY_WEIGHTS, VULNERABILITY_CATEGORIES


class ContextApi:  # Structured access to 500+ vulnerability patterns
    """Interface for the Parity Context Engine."""

    def __init__(self, http: httpx.Client) -> None:
        self._http = http
        self._rules_cache: list[StaticRule] | None = None

    def get(self, query: ContextQuery) -> ContextResult:
        """Query the context engine with combined filters."""
        params: dict[str, str] = {}
        if query.pattern:
            params["pattern"] = query.pattern
        if query.framework:
            params["framework"] = query.framework
        if query.severity:
            params["severity"] = query.severity
        if query.pattern_type:
            params["pattern_type"] = query.pattern_type

        response = self._http.get(ENDPOINTS["context"], params=params)
        response.raise_for_status()
        data = response.json()

        return ContextResult(
            rules=[
                StaticRule(
                    id=r["id"],
                    severity=r["severity"],
                    pattern_type=r["patternType"],
                    description=r["description"],
                    detection_hint=r["detectionHint"],
                )
                for r in data.get("rules", [])
            ],
            audit_findings=[
                AuditFindingEntry(
                    source=f["source"],
                    vulnerability_class=f["vulnerabilityClass"],
                    severity=f["severity"],
                    description=f["description"],
                    fix_pattern=f["fixPattern"],
                )
                for f in data.get("auditFindings", [])
            ],
            framework_patterns=[
                FrameworkPatternEntry(
                    framework=p["framework"],
                    pattern_name=p["patternName"],
                    description=p["description"],
                    example_code=p["exampleCode"],
                )
                for p in data.get("frameworkPatterns", [])
            ],
        )

    def get_rules(self, pattern_type: str | None = None) -> list[StaticRule]:
        """Get static analysis rules, optionally filtered by pattern type."""
        if self._rules_cache is not None and pattern_type is None:
            return self._rules_cache

        query = ContextQuery(pattern_type=pattern_type)
        result = self.get(query)

        if pattern_type is None:
            self._rules_cache = result.rules

        return result.rules

    def get_audit_findings(self, severity: str | None = None) -> list[AuditFindingEntry]:
        """Get curated audit findings, optionally filtered by severity."""
        query = ContextQuery(severity=severity)
        result = self.get(query)
        return result.audit_findings

    def get_framework_patterns(self, framework: str = "anchor") -> list[FrameworkPatternEntry]:
        """Get framework-specific patterns."""
        query = ContextQuery(framework=framework)
        result = self.get(query)
        return result.framework_patterns

    def get_vulnerability_categories(self) -> tuple[str, ...]:
        """Return all known vulnerability categories."""
        return VULNERABILITY_CATEGORIES

    def calculate_risk_score(self, findings: list[AuditFindingEntry]) -> int:
        """Calculate a risk score based on findings severities."""
        if not findings:
            return 100

        score = 100
        for finding in findings:
            weight = SEVERITY_WEIGHTS.get(finding.severity, 0)
            score = max(0, score - weight)

        return score

    def categorize_findings(
        self, findings: list[AuditFindingEntry]
    ) -> dict[str, list[AuditFindingEntry]]:
        """Group findings by severity level."""
        categories: dict[str, list[AuditFindingEntry]] = {
            "critical": [],
            "high": [],
            "medium": [],
            "info": [],
            "pass": [],
        }

        for finding in findings:
            if finding.severity in categories:
                categories[finding.severity].append(finding)

        return categories

    def clear_cache(self) -> None:
        """Clear cached rules."""
        self._rules_cache = None
