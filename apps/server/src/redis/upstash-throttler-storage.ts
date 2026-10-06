import { Injectable, Inject } from "@nestjs/common"
import { ThrottlerStorage } from "@nestjs/throttler"
import { REDIS_CLIENT } from "./redis.module.js"
import { Redis } from "@upstash/redis"

export interface ThrottlerStorageRecord {
  totalHits: number
  timeToExpire: number
  isBlocked: boolean
  timeToBlockExpire: number
}

@Injectable()
export class UpstashThrottlerStorage implements ThrottlerStorage {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis | null) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string
  ): Promise<ThrottlerStorageRecord> {
    if (!this.redis) {
      return this.fallbackIncrement(key, ttl, limit, blockDuration, throttlerName)
    }

    const now = Date.now()
    const ttlSec = Math.ceil(ttl / 1000)
    const blockSec = Math.ceil(blockDuration / 1000)
    const redisKey = `throttle:${throttlerName}:${key}`

    const multi = this.redis.multi()
    multi.zadd(redisKey, { score: now, member: `${now}-${Math.random()}` })
    multi.expire(redisKey, ttlSec + blockSec)
    multi.zremrangebyscore(redisKey, 0, now - ttl)
    await multi.exec()

    const countResult = await this.redis.zcard(redisKey)
    const totalHits = (countResult as number) || 0

    const isBlocked = totalHits > limit
    const timeToExpire = ttlSec
    const timeToBlockExpire = isBlocked ? blockSec : 0

    return { totalHits, timeToExpire, isBlocked, timeToBlockExpire }
  }

  private fallbackIncrement(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string
  ): ThrottlerStorageRecord {
    return { totalHits: 0, timeToExpire: Math.ceil(ttl / 1000), isBlocked: false, timeToBlockExpire: 0 }
  }
}