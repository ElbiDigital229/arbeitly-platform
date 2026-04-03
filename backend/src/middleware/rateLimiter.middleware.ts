import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { valkey } from '../config/valkey.js';

/**
 * Rate limiter for auth endpoints: 10 requests per 15 minutes per IP.
 * Falls back to in-memory store if Valkey is unavailable.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  store: new RedisStore({
    sendCommand: (...args: string[]) =>
      (valkey as any).call(args[0], ...args.slice(1)),
  }),
});
