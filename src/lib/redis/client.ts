// src/lib/redis/client.ts
// Cache Redis via @upstash/redis — compatible Vercel edge runtime
// Graceful degradation si UPSTASH_REDIS_REST_URL non configuré
import { Redis } from '@upstash/redis'

let redis: Redis | null = null

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[Redis] UPSTASH_REDIS_REST_URL non défini — cache désactivé')
    }
    return null
  }

  if (!redis) {
    redis = new Redis({ url, token })
  }
  return redis
}

/**
 * Rate limiter : incrémente un compteur Redis et vérifie la limite.
 * Graceful degradation : si Redis n'est pas configuré ou échoue, autorise la requête.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const client = getRedisClient()

  if (!client) {
    return { allowed: true, remaining: limit }
  }

  try {
    const current = await client.incr(key)
    if (current === 1) {
      await client.expire(key, windowSeconds)
    }
    const remaining = Math.max(0, limit - current)
    return { allowed: current <= limit, remaining }
  } catch {
    return { allowed: true, remaining: limit }
  }
}

/**
 * Helper cache générique : retourne la valeur en cache ou exécute le fetcher et met en cache.
 * Graceful degradation : si Redis n'est pas configuré ou échoue, appelle directement le fetcher.
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const client = getRedisClient()

  if (!client) {
    return fetcher()
  }

  try {
    const cached = await client.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await fetcher()
    await client.set(key, value, { ex: ttlSeconds })
    return value
  } catch (error) {
    console.error(`[Redis] Cache error for key ${key}:`, error)
    return fetcher()
  }
}
