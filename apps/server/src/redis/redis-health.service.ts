import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';
import { REDIS_CLIENT } from './redis.module.js';

@Injectable()
export class RedisHealthService implements OnModuleInit {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis | null,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit() {
    // Initial health check
    await this.ping();
  }

  // Ping every 7 days to keep Redis connection alive (prevents free tier deletion due to inactivity)
  @Cron('0 0 * * 0') // Every Sunday at midnight
  async ping(): Promise<boolean> {
    if (!this.redis) {
      this.log('Redis not configured, skipping ping');
      return false;
    }

    try {
      const result = await this.redis.ping();
      this.log(`Redis ping: ${result}`);
      return result === 'PONG';
    } catch (error) {
      this.log(`Redis ping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; latency?: number }> {
    if (!this.redis) {
      return { status: 'unhealthy' };
    }

    const start = Date.now();
    try {
      const result = await this.redis.ping();
      const latency = Date.now() - start;
      return {
        status: result === 'PONG' ? 'healthy' : 'degraded',
        latency,
      };
    } catch {
      return { status: 'unhealthy' };
    }
  }

  private log(message: string) {
    const prefix = '[RedisHealth]';
    if (this.configService.get('NODE_ENV') === 'development') {
      console.log(`${prefix} ${message}`);
    }
  }
}
