from __future__ import annotations

from solders.pubkey import Pubkey

from parity_sdk.constants import DEFAULT_SOLANA_RPC


PROGRAM_ID = Pubkey.from_string("PARTYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx1")


class SolanaProvider:
    """Solana on-chain interaction provider for PDA derivation and account fetching."""

    def __init__(
        self,
        rpc_url: str | None = None,
        program_id: str | None = None,
    ) -> None:
        self._rpc_url = rpc_url or DEFAULT_SOLANA_RPC
        self._program_id = (
            Pubkey.from_string(program_id) if program_id else PROGRAM_ID
        )

    def get_registry_address(self) -> tuple[Pubkey, int]:
        """Derive the registry PDA address."""
        return Pubkey.find_program_address(
            [b"registry"],
            self._program_id,
        )

    def get_program_entry_address(self, program_hash: bytes) -> tuple[Pubkey, int]:
        """Derive a program entry PDA address from its hash."""
        return Pubkey.find_program_address(
            [b"program", program_hash],
            self._program_id,
        )

    def get_analysis_address(
        self,
        program_entry_pubkey: Pubkey,
        auditor_pubkey: Pubkey,
    ) -> tuple[Pubkey, int]:
        """Derive an analysis report PDA address."""
        return Pubkey.find_program_address(