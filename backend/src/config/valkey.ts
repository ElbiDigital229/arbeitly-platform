import Redis from 'ioredis';
import { env } from './env.js';

export const valkey = new Redis(env.VALKEY_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

valkey.on('error', (err) => {
  console.error('Valkey connection error:', err);
});

valkey.on('connect', () => {
  console.log('Valkey connected.');
});
