import { systemSettingRepository } from '../repositories/system-setting.repository.js';
import { env } from '../config/env.js';

export interface AiConfig {
  apiKey: string;
  model: string;
  cvParseModel: string;
  maxTokens: number;
}

const KEYS = {
  apiKey: 'ai.apiKey',
  model: 'ai.model',
  cvParseModel: 'ai.cvParseModel',
  maxTokens: 'ai.maxTokens',
} as const;

const CACHE_TTL_MS = 30_000;

let cache: { value: AiConfig; expiresAt: number } | null = null;

function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••';
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

export const aiConfigService = {
  /** Resolves current effective config (DB overrides → env defaults). Cached for 30s. */
  async get(): Promise<AiConfig> {
    if (cache && cache.expiresAt > Date.now()) return cache.value;

    const rows = await systemSettingRepository.getAll();
    const map = new Map(rows.map((r) => [r.key, r.value]));

    const config: AiConfig = {
      apiKey: map.get(KEYS.apiKey) || env.ANTHROPIC_API_KEY,
      model: map.get(KEYS.model) || env.AI_MODEL,
      cvParseModel: map.get(KEYS.cvParseModel) || env.AI_CV_PARSE_MODEL,
      maxTokens: Number(map.get(KEYS.maxTokens)) || env.AI_MAX_TOKENS,
    };

    cache = { value: config, expiresAt: Date.now() + CACHE_TTL_MS };
    return config;
  },

  /** Returns the config with the API key masked — safe for admin UI. */
  async getMasked() {
    const c = await this.get();
    return {
      apiKey: maskKey(c.apiKey),
      apiKeySet: !!c.apiKey,
      model: c.model,
      cvParseModel: c.cvParseModel,
      maxTokens: c.maxTokens,
    };
  },

  /** Update settings. Pass apiKey only when rotating it; omit to keep current. */
  async update(input: Partial<AiConfig>) {
    const entries: Record<string, string> = {};
    if (input.apiKey !== undefined && input.apiKey.trim()) entries[KEYS.apiKey] = input.apiKey.trim();
    if (input.model !== undefined) entries[KEYS.model] = input.model;
    if (input.cvParseModel !== undefined) entries[KEYS.cvParseModel] = input.cvParseModel;
    if (input.maxTokens !== undefined) entries[KEYS.maxTokens] = String(input.maxTokens);

    if (Object.keys(entries).length > 0) {
      await systemSettingRepository.upsertMany(entries);
    }
    cache = null; // invalidate
    return this.getMasked();
  },

  /** Force-clear the cache (e.g. after a key rotation from another instance). */
  invalidate() {
    cache = null;
  },
};
