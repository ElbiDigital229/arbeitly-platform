import type { RequestHandler } from 'express';
import { valkey } from '../config/valkey.js';

/**
 * Cache GET responses in Valkey keyed by user ID + URL.
 * Falls through gracefully if Valkey is unavailable.
 */
export function cache(ttlSeconds: number): RequestHandler {
  return async (req, res, next) => {
    // Only cache GET requests from authenticated users
    if (req.method !== 'GET' || !req.user?.id) {
      return next();
    }

    const key = `cache:user:${req.user.id}:${req.originalUrl}`;

    try {
      const cached = await valkey.get(key);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }
    } catch {
      // Valkey down — proceed without cache
    }

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        valkey.setex(key, ttlSeconds, JSON.stringify(body)).catch(() => {});
      }
      res.set('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}
