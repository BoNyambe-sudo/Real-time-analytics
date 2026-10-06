import { Module } from "@nestjs/common"
import { ThrottlerModule } from "@nestjs/throttler"
import { ConfigService } from "@nestjs/config"
import { UpstashThrottlerStorage } from "../redis/upstash-throttler-storage.js"
import { InMemoryThrottlerStorage } from "../redis/in-memory-throttler-storage.js"
import { REDIS_CLIENT } from "../redis/redis.module.js"
import { Redis } from "@upstash/redis"

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: (config: ConfigService, redis: Redis | null, upstashStorage: UpstashThrottlerStorage, memoryStorage: InMemoryThrottlerStorage) => {
        const storage = redis ? upstashStorage : memoryStorage
        return [
          {
            ttl: 60000,
            limit: 100,
            storage,
          },
        ]
      },
      inject: [ConfigService, REDIS_CLIENT, UpstashThrottlerStorage, InMemoryThrottlerStorage],
    }),
  ],
  providers: [UpstashThrottlerStorage, InMemoryThrottlerStorage],
  exports: [ThrottlerModule, UpstashThrottlerStorage, InMemoryThrottlerStorage],
})
export class RateLimitModule {}