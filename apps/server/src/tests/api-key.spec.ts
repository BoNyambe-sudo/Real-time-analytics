import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiKeyService } from '../api-keys/api-key.service.js';
import { ApiKeyModel } from '../schemas/api-key.schema.js';

describe('ApiKeyService', () => {
  let service: ApiKeyService;

  beforeEach(() => {
    service = new ApiKeyService();
    vi.clearAllMocks();
  });

  it('should generate and store api key', async () => {
    const mockDoc = {
      _id: 'key-1',
      orgId: 'org-1',
      name: 'test',
      prefix: 'abc12345',
      hash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.spyOn(ApiKeyModel, 'create').mockResolvedValue(mockDoc as any);

    const result = await service.create('org-1', 'test-key');
    expect(result.key).toHaveLength(64);
    expect(result.key).toMatch(/^[a-f0-9]{64}$/);
    expect(result.doc.prefix).toBe(result.key.slice(0, 8));
    expect(ApiKeyModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'org-1',
        name: 'test-key',
      })
    );
  });

  it('should verify valid api key', async () => {
    const key = 'a'.repeat(64);
    const hash = 'sha256-hash';
    vi.spyOn(ApiKeyModel, 'findOne').mockResolvedValue({
      ...mockDoc,
      hash,
      verify: (k: string) => k === key,
    } as any);

    const result = await service.verify(key);
    expect(result).toBeTruthy();
  });

  it('should reject invalid api key', async () => {
    vi.spyOn(ApiKeyModel, 'findOne').mockResolvedValue(null);
    const result = await service.verify('invalid-key');
    expect(result).toBeNull();
  });

  it('should revoke api key', async () => {
    const mockDoc = { _id: 'key-1', orgId: 'org-1', name: 'test', revokedAt: new Date() };
    vi.spyOn(ApiKeyModel, 'findOneAndUpdate').mockResolvedValue(mockDoc as any);

    const result = await service.revoke('org-1', 'key-1');
    expect(result.revokedAt).toBeInstanceOf(Date);
  });

  it('should regenerate api key', async () => {
    const mockDoc = {
      _id: 'key-1',
      orgId: 'org-1',
      name: 'test',
      prefix: 'newprefix',
      hash: 'newhash',
      revokedAt: undefined,
    };
    vi.spyOn(ApiKeyModel, 'findOneAndUpdate').mockResolvedValue(mockDoc as any);

    const result = await service.regenerate('org-1', 'key-1');
    expect(result).toBeTruthy();
    expect(result!.key).toHaveLength(64);
    expect(result!.doc.prefix).toBe('newprefix');
  });
});

const mockDoc = {
  _id: 'key-1',
  orgId: 'org-1',
  name: 'test',
  prefix: 'abc12345',
  hash: 'hash',
  createdAt: new Date(),
  updatedAt: new Date(),
};
