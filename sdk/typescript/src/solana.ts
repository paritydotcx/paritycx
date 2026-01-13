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

        try {
            const accountInfo = await this.connection.getAccountInfo(address);
            if (!accountInfo) return null;

            return this.deserializeAuditor(accountInfo.data);
        } catch {
            return null;
        }
    }

    async fetchBadge(programEntryPubkey: PublicKey): Promise<BadgeEntry | null> {
        const [address] = await this.getBadgeAddress(programEntryPubkey);

        try {
            const accountInfo = await this.connection.getAccountInfo(address);
            if (!accountInfo) return null;

            return this.deserializeBadge(accountInfo.data);
        } catch {
            return null;
        }
    }

    async getRegistryStats(): Promise<{
        totalPrograms: number;
        totalAnalyses: number;
        totalSkills: number;
        totalAuditors: number;
        totalPatterns: number;
    }> {
        const [registryAddress] = await this.getRegistryAddress();
        const accountInfo = await this.connection.getAccountInfo(registryAddress);

        if (!accountInfo) {
            throw new Error("Registry account not found");
        }

        const data = accountInfo.data;
        const offset = 8 + 32;
        return {
            totalPrograms: Number(data.readBigUInt64LE(offset)),
            totalAnalyses: Number(data.readBigUInt64LE(offset + 8)),
            totalSkills: Number(data.readBigUInt64LE(offset + 16)),
            totalAuditors: Number(data.readBigUInt64LE(offset + 24)),
            totalPatterns: Number(data.readBigUInt64LE(offset + 32)),
        };
    }

    getConnection(): Connection {
        return this.connection;
    }

    getProgramId(): PublicKey {
        return this.programId;
    }

    private deserializeProgramEntry(data: Buffer): ProgramEntry {
        let offset = 8;
        const owner = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
        offset += 32;

        const programHash = data.subarray(offset, offset + 32).toString("hex");
        offset += 32;

        const frameworkByte = data.readUInt8(offset);
        offset += 1;
        const frameworkMap: Record<number, Framework> = {
            0: "anchor",
            1: "native",
            2: "seahorse",
            3: "steel",
        };
        const framework = frameworkMap[frameworkByte] ?? "anchor";

        const uriLen = data.readUInt32LE(offset);
        offset += 4;
        const metadataUri = data.subarray(offset, offset + uriLen).toString("utf-8");
        offset += uriLen;

        const registeredAt = Number(data.readBigInt64LE(offset));
        offset += 8;

        offset += 8;

        const analysisCount = data.readUInt32LE(offset);
        offset += 4;

        const latestScore = data.readUInt8(offset);
        offset += 1;

        const isVerified = data.readUInt8(offset) === 1;

        return {
            owner,
            programHash,
            framework,
            metadataUri,
            registeredAt,
            analysisCount,
            latestScore,
            isVerified,
        };
    }

    private deserializeAuditor(data: Buffer): AuditorEntry {
        let offset = 8;
        const authority = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
        offset += 32;

        const nameLen = data.readUInt32LE(offset);
        offset += 4;
        const name = data.subarray(offset, offset + nameLen).toString("utf-8");
        offset += nameLen;

        const credLen = data.readUInt32LE(offset);
        offset += 4;
        const credentialsUri = data.subarray(offset, offset + credLen).toString("utf-8");
        offset += credLen;

        const totalAnalyses = Number(data.readBigUInt64LE(offset));
        offset += 8;

        const averageScore = Number(data.readBigUInt64LE(offset));
        offset += 8;

        const isActive = data.readUInt8(offset) === 1;

        return {
            authority,
            name,
            credentialsUri,
            totalAnalyses,
            averageScore,
            isActive,
        };
    }

    private deserializeBadge(data: Buffer): BadgeEntry {
        let offset = 8;
        const programEntry = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
        offset += 32;

        const issuer = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
        offset += 32;

        const tierByte = data.readUInt8(offset);
        offset += 1;
        const tierMap: Record<number, VerificationTier> = {
            0: "bronze",
            1: "silver",
            2: "gold",
            3: "platinum",
        };
        const tier = tierMap[tierByte] ?? "bronze";

        const scoreAtIssuance = data.readUInt8(offset);
        offset += 1;

        const issuedAt = Number(data.readBigInt64LE(offset));
        offset += 8;

        const expiresAt = Number(data.readBigInt64LE(offset));
        offset += 8;

        const isRevoked = data.readUInt8(offset) === 1;

        return {
            programEntry,
            issuer,
            tier,
            scoreAtIssuance,
            issuedAt,
            expiresAt,
            isRevoked,
        };
    }
}
