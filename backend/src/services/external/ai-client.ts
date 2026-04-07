import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import { HttpError } from '../../errors/HttpError.js';
import { aiConfigService } from '../ai-config.service.js';

// Cached SDK clients keyed by API key — avoids reconstructing on every call,
// but still picks up rotated keys (a new key produces a new entry).
const clientCache = new Map<string, Anthropic>();

function client(apiKey: string): Anthropic {
  let c = clientCache.get(apiKey);
  if (!c) {
    c = new Anthropic({
      apiKey,
      timeout: env.AI_TIMEOUT_MS,
      maxRetries: env.AI_MAX_RETRIES,
    });
    clientCache.set(apiKey, c);
  }
  return c;
}

export interface AiCompletionOptions {
  /** Override the configured model */
  model?: string;
  /** Override the configured max tokens */
  maxTokens?: number;
  system?: string;
  /** When true (default), throws if Anthropic returns stop_reason === 'max_tokens' */
  errorOnTruncation?: boolean;
  /** Force the CV-parse model variant (used by CV extraction) */
  useCvParseModel?: boolean;
}

/**
 * Send a prompt to Anthropic and return the assistant text. Resolves API key +
 * model from the dynamic AI config (DB → env fallback) on every call (cached 30s).
 */
export async function aiComplete(
  content: Anthropic.MessageParam['content'],
  opts: AiCompletionOptions = {},
): Promise<string> {
  const cfg = await aiConfigService.get();
  if (!cfg.apiKey) {
    throw HttpError.internal('AI is not configured. Set the Anthropic API key in Super Admin → AI Config.');
  }
  const model = opts.model ?? (opts.useCvParseModel ? cfg.cvParseModel : cfg.model);
  const maxTokens = opts.maxTokens ?? cfg.maxTokens;

  const response = await client(cfg.apiKey).messages.create({
    model,
    max_tokens: maxTokens,
    ...(opts.system ? { system: opts.system } : {}),
    messages: [{ role: 'user', content }],
  });

  if ((opts.errorOnTruncation ?? true) && response.stop_reason === 'max_tokens') {
    throw HttpError.badRequest('AI response was truncated. Try shorter input or increase AI_MAX_TOKENS.');
  }

  const textBlock = response.content.find((c) => c.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw HttpError.internal('No text response from AI');
  }
  return textBlock.text;
}

/**
 * Strip ```json fences and extract the outermost JSON object/array. Handles trailing
 * commas. Throws an HttpError on parse failure.
 */
export function parseAiJson<T = unknown>(rawText: string): T {
  let jsonText = rawText.trim();

  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  const firstBrace = jsonText.indexOf('{');
  const firstBracket = jsonText.indexOf('[');
  const start =
    firstBrace === -1 ? firstBracket : firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket);
  const lastBrace = jsonText.lastIndexOf('}');
  const lastBracket = jsonText.lastIndexOf(']');
  const end = Math.max(lastBrace, lastBracket);

  if (start !== -1 && end > start) {
    jsonText = jsonText.slice(start, end + 1);
  }

  // Strip trailing commas before } or ]
  jsonText = jsonText.replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(jsonText) as T;
  } catch (err) {
    console.error('AI JSON parse failed. Raw (first 500):', jsonText.slice(0, 500));
    throw HttpError.internal(`Failed to parse AI JSON response: ${(err as Error).message}`);
  }
}

/** Convenience: complete a prompt and parse the response as JSON. */
export async function aiCompleteJson<T = unknown>(
  content: Anthropic.MessageParam['content'],
  opts: AiCompletionOptions = {},
): Promise<T> {
  const text = await aiComplete(content, opts);
  return parseAiJson<T>(text);
}
