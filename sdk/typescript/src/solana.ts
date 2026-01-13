import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet, BN } from "@coral-xyz/anchor";
import { DEFAULT_SOLANA_RPC } from "./constants";
import {
    SolanaCluster,
    Framework,
    ProgramEntry,
    AuditorEntry,
    BadgeEntry,
    VerificationTier,
    AnalysisFindingsCount,
} from "./types";

const PROGRAM_ID = new PublicKey("PARTYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx1");

export class SolanaProvider {
    private readonly connection: Connection;
    private readonly programId: PublicKey;

    constructor(rpcUrl?: string, programId?: string) {
        this.connection = new Connection(rpcUrl ?? DEFAULT_SOLANA_RPC, "confirmed");
        this.programId = programId ? new PublicKey(programId) : PROGRAM_ID;
    }

    async getRegistryAddress(): Promise<[PublicKey, number]> {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("registry")],
            this.programId
        );
    }

    async getProgramEntryAddress(programHash: Buffer): Promise<[PublicKey, number]> {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("program"), programHash],
            this.programId
        );
    }

    async getAnalysisAddress(
        programEntryPubkey: PublicKey,
        auditorPubkey: PublicKey
    ): Promise<[PublicKey, number]> {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("analysis"),
                programEntryPubkey.toBuffer(),
                auditorPubkey.toBuffer(),
            ],
            this.programId
        );
    }

    async getSkillAddress(skillName: string): Promise<[PublicKey, number]> {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("skill"), Buffer.from(skillName)],
            this.programId
        );
    }

    async getAuditorAddress(authority: PublicKey): Promise<[PublicKey, number]> {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("auditor"), authority.toBuffer()],
            this.programId
        );
    }

    async getBadgeAddress(programEntryPubkey: PublicKey): Promise<[PublicKey, number]> {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("badge"), programEntryPubkey.toBuffer()],
            this.programId
        );
    }

    async getPatternAddress(patternId: string): Promise<[PublicKey, number]> {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("pattern"), Buffer.from(patternId)],
            this.programId
        );
    }

    async fetchProgramEntry(programHash: Buffer): Promise<ProgramEntry | null> {
        const [address] = await this.getProgramEntryAddress(programHash);

        try {
            const accountInfo = await this.connection.getAccountInfo(address);
            if (!accountInfo) return null;

            return this.deserializeProgramEntry(accountInfo.data);
        } catch {
            return null;
        }
    }

    async fetchAuditor(authority: PublicKey): Promise<AuditorEntry | null> {
        const [address] = await this.getAuditorAddress(authority);