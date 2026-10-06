import { describe, it, expect, vi, beforeEach } from "vitest"
import { UpstashThrottlerStorage } from "../redis/upstash-throttler-storage.js"
import { ThrottlerStorageRecord } from "@nestjs/throttler"

describe("UpstashThrottlerStorage", () => {
  let storage: UpstashThrottlerStorage
  let mockRedis: any

  beforeEach(() => {
    mockRedis = {
      multi: vi.fn(() => ({
        zadd: vi.fn().mockReturnThis(),
        expire: vi.fn().mockReturnThis(),
        zremrangebyscore: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([]),
      })),
      zcard: vi.fn().mockResolvedValue(1),
    }
    storage = new UpstashThrottlerStorage(mockRedis)
  })

  it("should return fallback record when redis is null", async () => {
    const nullStorage = new UpstashThrottlerStorage(null)
    const result = await nullStorage.increment("key", 60000, 100, 60000, "test")
    expect(result).toEqual({
      totalHits: 0,
      timeToExpire: 60,
      isBlocked: false,
      timeToBlockExpire: 0,
    })
  })

  it("should increment and return record", async () => {
    mockRedis.zcard.mockResolvedValueOnce(5)
    const result = await storage.increment("test-key", 60000, 100, 60000, "test")

    expect(mockRedis.multi).toHaveBeenCalled()
    expect(result.totalHits).toBe(5)
    expect(result.timeToExpire).toBe(60)
    expect(result.isBlocked).toBe(false)
  })

  it("should mark as blocked when limit exceeded", async () => {
    mockRedis.zcard.mockResolvedValueOnce(150)
    const result = await storage.increment("test-key", 60000, 100, 60000, "test")

    expect(result.totalHits).toBe(150)
    expect(result.isBlocked).toBe(true)
    expect(result.timeToBlockExpire).toBe(60)
  })
})