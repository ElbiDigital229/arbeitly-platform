import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for auth endpoints: 10 requests per 15 minutes per IP.
 * Uses in-memory store (no Redis dependency).
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});
