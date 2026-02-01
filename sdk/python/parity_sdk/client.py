from __future__ import annotations

import httpx

from parity_sdk.types import (
    ParityConfig,
    AnalyzeOptions,
    AnalysisResult,
    ProgramEntry,
    RegistryStats,
)
from parity_sdk.constants import (
    DEFAULT_BASE_URL,
    DEFAULT_TIMEOUT,
    DEFAULT_RETRIES,
    DEFAULT_RETRY_DELAY,
    ENDPOINTS,
    API_VERSION,
)
from parity_sdk.skills import SkillsApi
from parity_sdk.context import ContextApi
from parity_sdk.analysis import AnalysisEngine


class ParityClient:
    """Primary client for interacting with the Parity API."""

    def __init__(self, config: ParityConfig) -> None:
        self._config = config
        self._base_url = config.base_url or DEFAULT_BASE_URL
        self._timeout = config.timeout or DEFAULT_TIMEOUT
        self._retries = config.retries or DEFAULT_RETRIES
        self._retry_delay = config.retry_delay or DEFAULT_RETRY_DELAY

        self._http = httpx.Client(
            base_url=self._base_url,
            timeout=self._timeout,
            headers={
                "Authorization": f"Bearer {config.api_key}",
                "Content-Type": "application/json",
                "X-Parity-SDK-Version": API_VERSION,
                "User-Agent": f"parity-sdk-py/{API_VERSION}",
            },
        )

        self.skills = SkillsApi(self._http)
        self.context = ContextApi(self._http)
        self._engine = AnalysisEngine(self._http, self.skills, self.context)

    def analyze(self, options: AnalyzeOptions) -> AnalysisResult:
        """Analyze a Solana program with one or more skills."""
        return self._engine.analyze(options)

    def get_program(self, program_hash: str) -> ProgramEntry:
        """Get a registered program by its hash."""