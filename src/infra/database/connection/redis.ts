// src/shared/cache/redis.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379
});

export class CacheHelper {
  static async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  static async set<T>(key: string, value: T, ttlSeconds = 600): Promise<void> {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  static async del(key: string): Promise<void> {
    await redis.del(key);
  }
}
