import { Injectable } from "@nestjs/common"
import { ThrottlerStorage } from "@nestjs/throttler"

export interface ThrottlerStorageRecord {
  totalHits: number
  timeToExpire: number
  isBlocked: boolean
  timeToBlockExpire: number
}

interface MemoryRecord {
  timestamps: number[]
  blockedUntil?: number
}

@Injectable()
export class InMemoryThrottlerStorage implements ThrottlerStorage {
  private store = new Map<string, MemoryRecord>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
    this.cleanupInterval.unref()
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string
  ): Promise<ThrottlerStorageRecord> {
    const fullKey = `${throttlerName}:${key}`
    const now = Date.now()
    const record = this.store.get(fullKey) || { timestamps: [] }

    const blockedUntil = record.blockedUntil
    if (blockedUntil && now < blockedUntil) {
      return {
        totalHits: record.timestamps.length,
        timeToExpire: Math.ceil((blockedUntil - now) / 1000),
        isBlocked: true,
        timeToBlockExpire: Math.ceil((blockedUntil - now) / 1000),
      }
    }

    record.timestamps = record.timestamps.filter((ts) => ts > now - ttl)
    record.timestamps.push(now)
    record.blockedUntil = undefined

    this.store.set(fullKey, record)

    const isBlocked = record.timestamps.length > limit
    let timeToBlockExpire = 0
    if (isBlocked) {
      record.blockedUntil = now + blockDuration
      timeToBlockExpire = Math.ceil(blockDuration / 1000)
    }

    return {
      totalHits: record.timestamps.length,
      timeToExpire: Math.ceil(ttl / 1000),
      isBlocked,
      timeToBlockExpire,
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, record] of this.store.entries()) {
      if (record.blockedUntil && now > record.blockedUntil) {
        this.store.delete(key)
      } else if (record.timestamps.length === 0 || record.timestamps[record.timestamps.length - 1] < now - 300000) {
        this.store.delete(key)
      }
    }
  }
}