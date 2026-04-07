import rateLimit, { ipKeyGenerator, type Options } from 'express-rate-limit';
import type { Request } from 'express';

const message = {
  success: false,
  error: 'Too many requests. Please try again later.',
  code: 'RATE_LIMIT_EXCEEDED',
} as const;

const baseOpts: Partial<Options> = {
  standardHeaders: true,
  legacyHeaders: false,
  message,
};

// Key by user id when authenticated, otherwise IP (via the official helper
// that handles IPv6 prefixing). Lets us limit per-account instead of per-IP
// for protected endpoints — what actually protects Anthropic spend.
const userOrIp = (req: Request): string =>
  req.user?.id ?? ipKeyGenerator(req.ip ?? '');

/**
 * Auth endpoints: 10 req / 15 min per IP. Tight because credential stuffing.
 */
export const authRateLimiter = rateLimit({
  ...baseOpts,
  windowMs: 15 * 60 * 1000,
  max: 10,
});

/**
 * AI endpoints (CV enhance, tailor, CL generate, job scoring):
 * 20 req / 10 min per user. Each call can cost real money on Anthropic.
 */
export const aiRateLimiter = rateLimit({
  ...baseOpts,
  windowMs: 10 * 60 * 1000,
  max: 20,
  keyGenerator: userOrIp,
});

/**
 * File upload / parse (CV upload that triggers AI parse):
 * 10 req / 10 min per user. Bigger payloads + AI = expensive.
 */
export const uploadRateLimiter = rateLimit({
  ...baseOpts,
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyGenerator: userOrIp,
});

/**
 * PDF export: 30 req / 10 min per user. Cheaper than AI but still CPU-heavy
 * (puppeteer/headless). Looser than AI limiter.
 */
export const exportRateLimiter = rateLimit({
  ...baseOpts,
  windowMs: 10 * 60 * 1000,
  max: 30,
  keyGenerator: userOrIp,
});
