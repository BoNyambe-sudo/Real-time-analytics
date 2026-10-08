import { Injectable, Inject } from '@nestjs/common';
import { MetricModel } from '../schemas/metric.schema.js';
import { REDIS_CLIENT } from '../redis/redis.module.js';
import { Redis } from '@upstash/redis';

const CACHE_TTL = 5;
const CACHE_PREFIX = 'metrics:summary:';

@Injectable()
export class MetricsService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis | null) {}

  async getSummary(orgId: string) {
    if (!this.redis) {
      const since = new Date(Date.now() - 60 * 60 * 1000);
      const docs = await MetricModel.find({ orgId, ts: { $gte: since } })
        .sort({ ts: 1 })
        .lean();
      if (docs.length === 0) {
        return { totalRevenue: 0, activeUsers: 0, errorRate: 0, latencyMs: 0 };
      }
      const latest = docs[docs.length - 1];
      const totalRevenue = docs.reduce((sum, d) => sum + d.revenue, 0);
      const avgErrorRate = docs.reduce((sum, d) => sum + d.errorRate, 0) / docs.length;
      const avgLatency = docs.reduce((sum, d) => sum + d.latencyMs, 0) / docs.length;
      return {
        totalRevenue,
        activeUsers: latest.activeUsers,
        errorRate: Math.round(avgErrorRate * 100) / 100,
        latencyMs: Math.round(avgLatency),
      };
    }

    const cacheKey = `${CACHE_PREFIX}${orgId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }

    const since = new Date(Date.now() - 60 * 60 * 1000);
    const docs = await MetricModel.find({ orgId, ts: { $gte: since } })
      .sort({ ts: 1 })
      .lean();

    if (docs.length === 0) {
      return { totalRevenue: 0, activeUsers: 0, errorRate: 0, latencyMs: 0 };
    }

    const latest = docs[docs.length - 1];
    const totalRevenue = docs.reduce((sum, d) => sum + d.revenue, 0);
    const avgErrorRate = docs.reduce((sum, d) => sum + d.errorRate, 0) / docs.length;
    const avgLatency = docs.reduce((sum, d) => sum + d.latencyMs, 0) / docs.length;

    const summary = {
      totalRevenue,
      activeUsers: latest.activeUsers,
      errorRate: Math.round(avgErrorRate * 100) / 100,
      latencyMs: Math.round(avgLatency),
    };

    await this.redis.setex(cacheKey, CACHE_TTL, JSON.stringify(summary));
    return summary;
  }

  async getTimeseries(orgId: string, range: '1h' | '24h' | '7d') {
    const now = new Date();
    let since: Date;
    let bucketMs: number;

    switch (range) {
      case '1h':
        since = new Date(now.getTime() - 60 * 60 * 1000);
        bucketMs = 60 * 1000;
        break;
      case '24h':
        since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        bucketMs = 5 * 60 * 1000;
        break;
      case '7d':
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        bucketMs = 60 * 60 * 1000;
        break;
    }

    const docs = await MetricModel.find({ orgId, ts: { $gte: since } })
      .sort({ ts: 1 })
      .lean();

    const buckets = new Map<
      number,
      {
        ts: Date;
        activeUsers: number;
        requestsPerSec: number;
        revenue: number;
        errorRate: number;
        latencyMs: number;
        count: number;
      }
    >();
    for (const doc of docs) {
      const bucketKey = Math.floor(doc.ts.getTime() / bucketMs) * bucketMs;
      const b = buckets.get(bucketKey) || {
        ts: new Date(bucketKey),
        activeUsers: 0,
        requestsPerSec: 0,
        revenue: 0,
        errorRate: 0,
        latencyMs: 0,
        count: 0,
      };
      b.activeUsers += doc.activeUsers;
      b.requestsPerSec += doc.requestsPerSec;
      b.revenue += doc.revenue;
      b.errorRate += doc.errorRate;
      b.latencyMs += doc.latencyMs;
      b.count++;
      buckets.set(bucketKey, b);
    }

    return Array.from(buckets.values())
      .sort((a, b) => a.ts.getTime() - b.ts.getTime())
      .map(b => ({
        ts: b.ts.toISOString(),
        activeUsers: Math.round(b.activeUsers / b.count),
        requestsPerSec: Math.round((b.requestsPerSec / b.count) * 100) / 100,
        revenue: Math.round((b.revenue / b.count) * 100) / 100,
        errorRate: Math.round((b.errorRate / b.count) * 100) / 100,
        latencyMs: Math.round(b.latencyMs / b.count),
      }));
  }
}
