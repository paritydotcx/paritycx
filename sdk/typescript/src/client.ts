import axios, { AxiosInstance, AxiosError } from "axios";
import {
    ParityConfig,
    AnalyzeOptions,
    AnalysisResult,
    RegistryStats,
    ProgramEntry,
} from "./types";
import {
    DEFAULT_BASE_URL,
    DEFAULT_TIMEOUT,
    DEFAULT_RETRIES,
    DEFAULT_RETRY_DELAY,
    ENDPOINTS,
    API_VERSION,
} from "./constants";
import { SkillsApi } from "./skills";
import { ContextApi } from "./context";
import { AnalysisEngine } from "./analysis";

export class ParityClient {
    private readonly httpClient: AxiosInstance;
    private readonly config: Required<
        Pick<ParityConfig, "apiKey" | "baseUrl" | "timeout" | "retries" | "retryDelay">
    >;

    public readonly skills: SkillsApi;
    public readonly context: ContextApi;
    private readonly engine: AnalysisEngine;

    constructor(config: ParityConfig) {
        this.config = {
            apiKey: config.apiKey,
            baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
            timeout: config.timeout ?? DEFAULT_TIMEOUT,
            retries: config.retries ?? DEFAULT_RETRIES,
            retryDelay: config.retryDelay ?? DEFAULT_RETRY_DELAY,
        };

        this.httpClient = axios.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout,
            headers: {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
                "X-Parity-SDK-Version": API_VERSION,
                "User-Agent": `parity-sdk-ts/${API_VERSION}`,
            },
        });

        this.httpClient.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const config = error.config as any;
                if (!config || !config._retryCount) {
                    config._retryCount = 0;
                }

                if (
                    config._retryCount < this.config.retries &&
                    error.response &&
                    error.response.status >= 500
                ) {
                    config._retryCount += 1;
                    const delay = this.config.retryDelay * Math.pow(2, config._retryCount - 1);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    return this.httpClient(config);
                }

                return Promise.reject(error);
            }
        );

        this.skills = new SkillsApi(this.httpClient);
        this.context = new ContextApi(this.httpClient);
        this.engine = new AnalysisEngine(this.httpClient, this.skills, this.context);
    }

    async analyze(options: AnalyzeOptions): Promise<AnalysisResult> {
        return this.engine.analyze(options);
    }

    async getProgram(programHash: string): Promise<ProgramEntry> {
        const response = await this.httpClient.get(
            `${ENDPOINTS.programs}/${programHash}`
        );
        return response.data;
    }

    async listPrograms(page: number = 1, limit: number = 20): Promise<ProgramEntry[]> {
        const response = await this.httpClient.get(ENDPOINTS.programs, {
            params: { page, limit },
        });
        return response.data;
    }

    async getRegistryStats(): Promise<RegistryStats> {
        const response = await this.httpClient.get(`${ENDPOINTS.programs}/stats`);
        return response.data;
    }

    async healthCheck(): Promise<{ status: string; version: string; uptime: number }> {
        const response = await this.httpClient.get(ENDPOINTS.health);
        return response.data;
    }

    getConfig(): Readonly<typeof this.config> {
        return Object.freeze({ ...this.config });
    }
}
