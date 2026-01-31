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
    MISSING_SIGNER_CHECK = "missing-signer-check"
    UNCHECKED_ARITHMETIC = "unchecked-arithmetic"
    UNVALIDATED_PDA = "unvalidated-pda"
    INSECURE_CPI = "insecure-cpi"
    ACCOUNT_DESERIALIZATION = "account-deserialization"
    RENT_EXEMPTION = "rent-exemption"
    CLOSE_ACCOUNT = "close-account"
    TYPE_COSPLAY = "type-cosplay"
    REINITIALIZATION_ATTACK = "reinitialization-attack"
    OWNER_CHECK = "owner-check"
    CUSTOM = "custom"


@dataclass
class ParityConfig:
    api_key: str
    base_url: str = "https://api.parity.cx"
    timeout: int = 30
    retries: int = 3
    retry_delay: float = 1.0
    solana_rpc_url: str = "https://api.devnet.solana.com"
    cluster: str = "devnet"


@dataclass
class FindingLocation:
    file: str
    line: int
    instruction: Optional[str] = None


@dataclass
class Finding:
    severity: str
    title: str
    location: FindingLocation
    description: str
    recommendation: str
    pattern: str


@dataclass
class AnalysisMetadata:
    framework: str
    analyzed_at: str
    duration: int
    program_id: Optional[str] = None


@dataclass
class AnalysisResult:
    score: int
    findings: list[Finding]
    summary: str
    skills: list[str]
    metadata: AnalysisMetadata


@dataclass
class AnalyzeOptions:
    program: str
    framework: str = "anchor"
    skills: list[str] = field(default_factory=lambda: ["security-audit"])
    output: str = "json"
    min_score: Optional[int] = None
    fail_on: Optional[list[str]] = None


@dataclass
class SkillInput:
    name: str
    type: str
    required: bool
    default: Optional[str] = None


@dataclass
class SkillOutput:
    name: str
    type: str


@dataclass
class SkillDefinition:
    name: str
    version: str
    description: str
    inputs: list[SkillInput]
    outputs: list[SkillOutput]
    steps: Optional[list[str]] = None


@dataclass
class ContextQuery:
    pattern: Optional[str] = None
    framework: Optional[str] = None
    severity: Optional[str] = None
    pattern_type: Optional[str] = None


@dataclass
class StaticRule:
    id: str
    severity: str
    pattern_type: str
    description: str
    detection_hint: str


@dataclass
class AuditFindingEntry:
    source: str
    vulnerability_class: str
    severity: str
    description: str
    fix_pattern: str


@dataclass
class FrameworkPatternEntry:
    framework: str
    pattern_name: str
    description: str
    example_code: str


@dataclass
class ContextResult:
    rules: list[StaticRule]
    audit_findings: list[AuditFindingEntry]
    framework_patterns: list[FrameworkPatternEntry]


@dataclass
class AnalysisFindingsCount:
    critical: int = 0
    high: int = 0
    medium: int = 0