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


class ContextApi:
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