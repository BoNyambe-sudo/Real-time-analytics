import { Module } from '@nestjs/common';
import { UpstashThrottlerStorage } from '../redis/upstash-throttler-storage.js';
import { InMemoryThrottlerStorage } from '../redis/in-memory-throttler-storage.js';

@Module({
  providers: [UpstashThrottlerStorage, InMemoryThrottlerStorage],
  exports: [UpstashThrottlerStorage, InMemoryThrottlerStorage],
})
export class ThrottlerStorageModule {}
