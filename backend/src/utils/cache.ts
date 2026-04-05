import { valkey } from '../config/valkey.js';

/**
 * Invalidate all cached keys for a user, optionally scoped by prefix.
 * Uses SCAN to avoid blocking Redis on large keyspaces.
 */
export async function invalidateUserCache(userId: string, prefix?: string): Promise<number> {
  const pattern = prefix
    ? `cache:user:${userId}:*${prefix}*`
    : `cache:user:${userId}:*`;

  let cursor = '0';
  let deleted = 0;

  do {
    const [nextCursor, keys] = await valkey.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length > 0) {
      await valkey.del(...keys);
      deleted += keys.length;
    }
  } while (cursor !== '0');

  return deleted;
}
