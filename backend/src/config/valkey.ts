import Redis from 'ioredis';
import { env } from './env.js';

export const valkey = new Redis(env.VALKEY_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 2) return null;
    return Math.min(times * 500, 2000);
  },
  enableOfflineQueue: false,
});

let warned = false;

valkey.on('error', () => {
  if (!warned) { console.warn('⚠️  Redis/Valkey unavailable — caching disabled.'); warned = true; }
});

valkey.on('connect', () => {
  console.log('Valkey connected.');
});

valkey.connect().catch(() => {});
