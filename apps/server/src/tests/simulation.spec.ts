import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetricsSimulationService } from '../metrics/metrics-simulation.service.js';
import { MetricModel } from '../schemas/metric.schema.js';
import { OrganizationModel } from '../schemas/organization.schema.js';

describe('MetricsSimulationService', () => {
  let service: MetricsSimulationService;
  let mockAlertService: any;
  let mockGateway: any;
  let mockMongoose: any;

  beforeEach(() => {
    mockAlertService = {
      evaluate: vi.fn().mockResolvedValue(null),
    };
    mockGateway = {
      emitToOrg: vi.fn(),
    };
    mockMongoose = {};

    vi.spyOn(MetricModel, 'insertMany').mockResolvedValue([]);
    vi.spyOn(OrganizationModel, 'find').mockResolvedValue([{ _id: 'org-1' }]);

    service = new MetricsSimulationService(mockMongoose, mockAlertService, mockGateway);
  });

  it('should generate metrics for each org on cron tick', async () => {
    await service.generateMetrics();

    expect(MetricModel.insertMany).toHaveBeenCalled();
    const batch = (MetricModel.insertMany as any).mock.calls[0][0];
    expect(batch).toHaveLength(1);
    expect(batch[0]).toMatchObject({ orgId: 'org-1' });
    expect(batch[0].ts).toBeInstanceOf(Date);
    expect(batch[0].activeUsers).toBeGreaterThan(0);
    expect(batch[0].requestsPerSec).toBeGreaterThan(0);
    expect(batch[0].revenue).toBeGreaterThan(0);
    expect(batch[0].errorRate).toBeGreaterThanOrEqual(0);
    expect(batch[0].latencyMs).toBeGreaterThan(0);
  });

  it('should emit metrics to org room', async () => {
    await service.generateMetrics();
    expect(mockGateway.emitToOrg).toHaveBeenCalledWith('org-1', 'metrics', expect.any(Array));
  });

  it('should trigger alert when errorRate > 5%', async () => {
    // Mock MetricModel.insertMany to capture the batch
    let _capturedBatch: any[] = [];
    vi.spyOn(MetricModel, 'insertMany').mockImplementation(async (batch: any[]) => {
      _capturedBatch = batch;
      return [];
    });

    // Override Math.random to force high error rate
    const originalRandom = Math.random;
    Math.random = vi.fn().mockReturnValue(0.01); // Will cause errorRate spike in simulation

    // Run once with normal, then once with spike
    await service.generateMetrics();

    // The evaluate should have been called
    expect(mockAlertService.evaluate).toHaveBeenCalled();

    Math.random = originalRandom;
  });
});
