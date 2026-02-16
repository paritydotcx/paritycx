DEFAULT_BASE_URL = "https://api.parity.cx"
DEFAULT_TIMEOUT = 30
DEFAULT_RETRIES = 3
DEFAULT_RETRY_DELAY = 1.0
DEFAULT_SOLANA_RPC = "https://api.devnet.solana.com"

API_VERSION = "v1"

ENDPOINTS = {
    "analyze": f"/{API_VERSION}/analyze",
    "skills": f"/{API_VERSION}/skills",
    "context": f"/{API_VERSION}/context",
    "programs": f"/{API_VERSION}/programs",
    "auditors": f"/{API_VERSION}/auditors",
    "badges": f"/{API_VERSION}/badges",
    "health": f"/{API_VERSION}/health",
}

SKILL_NAMES = {
    "SECURITY_AUDIT": "security-audit",
    "BEST_PRACTICES": "best-practices",
    "GAS_OPTIMIZATION": "gas-optimization",
    "DEEP_AUDIT": "deep-audit",
}

SEVERITY_WEIGHTS: dict[str, int] = {
    "critical": 25,
    "high": 15,
    "medium": 8,
    "info": 3,
    "pass": 0,
}

TIER_THRESHOLDS: dict[str, int] = {
    "bronze": 50,
    "silver": 70,
    "gold": 85,
    "platinum": 95,
}

MAX_PROGRAM_SIZE = 10 * 1024 * 1024
MAX_SKILLS_PER_ANALYSIS = 8

SUPPORTED_FRAMEWORKS = ("anchor", "native", "seahorse", "steel")

# Canonical list -- must stay in sync with the on-chain ContextPattern enum
VULNERABILITY_CATEGORIES = (
    "missing-signer-check",
    "unchecked-arithmetic",
    "unvalidated-pda",
    "insecure-cpi",
    "account-deserialization",
    "rent-exemption",
    "close-account",
    "type-cosplay",
    "reinitialization-attack",
    "owner-check",
)
