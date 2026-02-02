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
        response = self._request("GET", f"{ENDPOINTS['programs']}/{program_hash}")
        data = response.json()
        return ProgramEntry(
            owner=data["owner"],
            program_hash=data["programHash"],
            framework=data["framework"],
            metadata_uri=data["metadataUri"],
            registered_at=data["registeredAt"],
            analysis_count=data["analysisCount"],
            latest_score=data["latestScore"],
            is_verified=data["isVerified"],
        )

    def list_programs(self, page: int = 1, limit: int = 20) -> list[ProgramEntry]:
        """List registered programs with pagination."""
        response = self._request(
            "GET",
            ENDPOINTS["programs"],
            params={"page": page, "limit": limit},
        )
        data = response.json()
        programs = data.get("data", data) if isinstance(data, dict) else data
        return [
            ProgramEntry(
                owner=p["owner"],
                program_hash=p["programHash"],
                framework=p["framework"],
                metadata_uri=p["metadataUri"],
                registered_at=p["registeredAt"],
                analysis_count=p["analysisCount"],
                latest_score=p["latestScore"],
                is_verified=p["isVerified"],
            )
            for p in programs
        ]

    def get_registry_stats(self) -> RegistryStats:
        """Get registry-level statistics."""
        response = self._request("GET", f"{ENDPOINTS['programs']}/stats")
        data = response.json()
        return RegistryStats(
            total_programs=data["totalPrograms"],
            total_analyses=data["totalAnalyses"],
            total_skills=data["totalSkills"],
            total_auditors=data["totalAuditors"],
            total_patterns=data["totalPatterns"],
        )

    def health_check(self) -> dict:
        """Check API server health."""
        response = self._request("GET", ENDPOINTS["health"])
        return response.json()

    def _request(
        self,
        method: str,
        path: str,
        params: dict | None = None,
        json_data: dict | None = None,
    ) -> httpx.Response:
        """Execute an HTTP request with retry logic."""
        last_error: Exception | None = None

        for attempt in range(self._retries + 1):
            try:
                response = self._http.request(
                    method,
                    path,
                    params=params,
                    json=json_data,
                )
                response.raise_for_status()
                return response
            except httpx.HTTPStatusError as e:
                if e.response.status_code >= 500 and attempt < self._retries:
                    import time
                    time.sleep(self._retry_delay * (2 ** attempt))
                    last_error = e
                    continue
                raise ParityApiError(
                    f"API request failed: {e.response.status_code}",
                    status_code=e.response.status_code,
                    response_body=e.response.text,
                ) from e
            except httpx.RequestError as e:
                if attempt < self._retries:
                    import time
                    time.sleep(self._retry_delay * (2 ** attempt))
                    last_error = e
                    continue
                raise ParityConnectionError(
                    f"Connection failed: {e}"
                ) from e