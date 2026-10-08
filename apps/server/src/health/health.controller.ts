import { Controller, Get, Inject } from '@nestjs/common';
import { RedisHealthService } from '../redis/redis-health.service.js';
import { REDIS_CLIENT } from '../redis/redis.tokens.js';
import { Redis } from '@upstash/redis';

@Controller('health')
export class HealthController {
  constructor(
    private readonly redisHealthService: RedisHealthService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis | null
  ) {}

  @Get()
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('redis')
  async redisHealth() {
    const health = await this.redisHealthService.healthCheck();
    return {
      configured: !!this.redis,
      ...health,
    };
  }

  @Get('ready')
  async readiness() {
    const redisHealth = await this.redisHealthService.healthCheck();

    // Consider ready if Redis is healthy or not configured
    const ready = redisHealth.status !== 'unhealthy';

    return {
      ready,
      checks: {
        redis: {
          configured: !!this.redis,
          status: redisHealth.status,
        },
      },
    };
  }
}
