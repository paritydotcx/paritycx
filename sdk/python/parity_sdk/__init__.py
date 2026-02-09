"""
Parity SDK for Python
AI-native verification layer for Solana smart contracts
"""

from parity_sdk.client import ParityClient
from parity_sdk.analysis import AnalysisEngine
from parity_sdk.skills import SkillsApi
from parity_sdk.context import ContextApi
from parity_sdk.solana_provider import SolanaProvider
from parity_sdk.parser import SkillParser
from parity_sdk.types import (
    ParityConfig,
    AnalyzeOptions,
    AnalysisResult,
    Finding,
    FindingLocation,
    SkillDefinition,
    SkillInput,
    SkillOutput,
    ContextQuery,
    ContextResult,
    StaticRule,
    AuditFindingEntry,
    FrameworkPatternEntry,
    AnalysisFindingsCount,
    AnalysisMetadata,
)
from parity_sdk.constants import (
    DEFAULT_BASE_URL,
    DEFAULT_TIMEOUT,
    API_VERSION,
    SKILL_NAMES,
    SEVERITY_WEIGHTS,
    TIER_THRESHOLDS,
    VULNERABILITY_CATEGORIES,
)

__version__ = "0.3.0"

__all__ = [
    "ParityClient",
    "AnalysisEngine",
    "SkillsApi",
    "ContextApi",
    "SolanaProvider",
    "SkillParser",
    "ParityConfig",
    "AnalyzeOptions",
    "AnalysisResult",
    "Finding",
    "FindingLocation",
    "SkillDefinition",
    "SkillInput",
    "SkillOutput",
    "ContextQuery",
    "ContextResult",
    "StaticRule",
    "AuditFindingEntry",
    "FrameworkPatternEntry",
    "AnalysisFindingsCount",
    "AnalysisMetadata",
    "DEFAULT_BASE_URL",
    "DEFAULT_TIMEOUT",
    "API_VERSION",
    "SKILL_NAMES",
    "SEVERITY_WEIGHTS",
    "TIER_THRESHOLDS",
    "VULNERABILITY_CATEGORIES",
]
