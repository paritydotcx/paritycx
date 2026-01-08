import { AxiosInstance } from "axios";
import { SkillDefinition } from "./types";
import { ENDPOINTS, SKILL_NAMES } from "./constants";

export class SkillsApi {
    private readonly http: AxiosInstance;
    private cache: Map<string, SkillDefinition> = new Map();

    constructor(http: AxiosInstance) {
        this.http = http;
    }

    async list(): Promise<SkillDefinition[]> {
        const response = await this.http.get(ENDPOINTS.skills);
        const skills: SkillDefinition[] = response.data;

        for (const skill of skills) {
            this.cache.set(skill.name, skill);
        }

        return skills;
    }

    async get(name: string): Promise<SkillDefinition> {
        const cached = this.cache.get(name);
        if (cached) {
            return cached;
        }

        const response = await this.http.get(`${ENDPOINTS.skills}/${name}`);
        const skill: SkillDefinition = response.data;
        this.cache.set(name, skill);
        return skill;
    }

    async validate(name: string): Promise<boolean> {
        const validNames = Object.values(SKILL_NAMES);
        if (validNames.includes(name as any)) {
            return true;
        }

        try {
            await this.get(name);
            return true;