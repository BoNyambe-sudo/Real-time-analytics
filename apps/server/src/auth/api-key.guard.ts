import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyModel } from '../schemas/api-key.schema.js';
import { MONGOOSE_CONNECTION } from '../database/mongoose.module.js';
import { Inject } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(@Inject(MONGOOSE_CONNECTION) private readonly conn: typeof import('mongoose')) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['x-api-key'] || this.extractBearer(req.headers.authorization);

    console.log('[ApiKeyGuard] x-api-key header:', req.headers['x-api-key']);
    console.log('[ApiKeyGuard] authorization header:', req.headers.authorization);
    console.log('[ApiKeyGuard] extracted key:', key ? 'present' : 'null');

    if (!key) {
      console.log('[ApiKeyGuard] No key found, returning false');
      return false;
    }

    const apiKey = await this.verifyApiKey(key);
    if (!apiKey) {
      console.log('[ApiKeyGuard] verifyApiKey returned null, throwing UnauthorizedException');
      throw new UnauthorizedException('Invalid API key');
    }

    req.user = {
      id: apiKey._id.toString(),
      orgId: apiKey.orgId.toString(),
      role: 'api-key',
      apiKey: true,
    };
    console.log('[ApiKeyGuard] Success, user:', req.user);
    return true;
  }

  private async verifyApiKey(key: string) {
    const prefix = key.slice(0, 8);
    console.log('[ApiKeyGuard] Looking up prefix:', prefix);
    const doc = await ApiKeyModel.findOne({ prefix, revokedAt: { $exists: false } });
    console.log('[ApiKeyGuard] Found doc:', doc ? 'yes' : 'no');
    if (!doc) return null;

    if (doc.expiresAt && new Date() > doc.expiresAt) return null;
    if (!doc.verify(key)) {
      console.log('[ApiKeyGuard] Key verification failed');
      return null;
    }

    doc.lastUsedAt = new Date();
    await doc.save();
    return doc;
  }

  private extractBearer(authHeader?: string): string | null {
    if (!authHeader) return null;
    const [scheme, token] = authHeader.split(' ');
    return scheme.toLowerCase() === 'bearer' ? token : null;
  }
}
