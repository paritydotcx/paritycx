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