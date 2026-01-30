from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class FindingSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    INFO = "info"
    PASS = "pass"


class Framework(str, Enum):
    ANCHOR = "anchor"
    NATIVE = "native"
    SEAHORSE = "seahorse"
    STEEL = "steel"


class SkillType(str, Enum):
    SECURITY_AUDIT = "security-audit"
    BEST_PRACTICES = "best-practices"
    GAS_OPTIMIZATION = "gas-optimization"
    DEEP_AUDIT = "deep-audit"
    CUSTOM = "custom"


class VerificationTier(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class OutputFormat(str, Enum):
    JSON = "json"
    SARIF = "sarif"
    MARKDOWN = "markdown"
    TEXT = "text"


class PatternType(str, Enum):