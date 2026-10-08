import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlertService } from '../alerts/alert.service.js';
import { AlertModel } from '../schemas/alert.schema.js';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    service = new AlertService();
    vi.clearAllMocks();
  });

  it('should not create alert when errorRate <= 5%', async () => {
    vi.spyOn(AlertModel, 'findOne').mockResolvedValue(null);
    const result = await service.evaluate('org-1', { errorRate: 5, ts: new Date() });
    expect(result).toBeNull();
    expect(AlertModel.create).not.toHaveBeenCalled();
  });

  it('should create alert when errorRate > 5%', async () => {
    vi.spyOn(AlertModel, 'findOne').mockResolvedValue(null);
    const mockAlert = {
      _id: 'alert-1',
      orgId: 'org-1',
      type: 'error_rate',
      message: 'test',
      value: 6,
      threshold: 5,
      ts: new Date(),
    };
    vi.spyOn(AlertModel, 'create').mockResolvedValue(mockAlert as any);

    const result = await service.evaluate('org-1', { errorRate: 6, ts: new Date() });
    expect(result).toEqual(mockAlert);
    expect(AlertModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'org-1',
        type: 'error_rate',
        value: 6,
        threshold: 5,
      })
    );
  });

  it('should not create duplicate alert within cooldown', async () => {
    const existingAlert = { _id: 'alert-1', orgId: 'org-1', type: 'error_rate', ts: new Date() };
    vi.spyOn(AlertModel, 'findOne').mockResolvedValue(existingAlert as any);

    const result = await service.evaluate('org-1', { errorRate: 6, ts: new Date() });
    expect(result).toBeNull();
    expect(AlertModel.create).not.toHaveBeenCalled();
  });
});
