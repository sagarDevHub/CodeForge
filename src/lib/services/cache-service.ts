import { CACHE_TTL, redis } from "../redis/client";

export interface CacheOptions {
  ttl?: number;
  forceRefresh?: boolean;
}

export class CacheService {
  /**
   * Get cached data or fetch and cache if not exists
   */
  static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    const { ttl = CACHE_TTL.ARCHITECTURE, forceRefresh = false } = options;

    if (!forceRefresh) {
      const cached = await redis.get<T>(key);
      if (cached !== null) {
        console.log(`Cache hit: ${key}`);
        return cached;
      }
    }

    console.log(`Cache Miss ${key}, fetching...`);
    const data = await fetchFn();

    await redis.setex(key, ttl, data);
    console.log(`Cached: ${key} (TTL: ${ttl}s)`);
    return data;
  }

  /**
   * Invalidate cache by key
   */

  static async invalidate(key: string): Promise<void> {
    await redis.del(key);
    console.log(`Cache invalidated: ${key}`);
  }

  /**
   * Invalidate all keys matching a pattern
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Cache invalidated ${keys.length} keys matching: ${pattern}`);
    }
  }

  /**
   * Get cache TTL for a key
   */
  static async getTTL(key: string): Promise<number> {
    return await redis.ttl(key);
  }

  /**
   * Check if key exists in cache
   */
  static async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  }

  /**
   * Clear all cache
   */
  static async clearAll(): Promise<void> {
    const keys = await redis.keys("*");
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Cleared all cache (${keys.length} keys)`);
    }
  }
}
