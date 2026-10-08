import { Controller, Get, Post, Delete, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiKeyService } from './api-key.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { z } from 'zod';

const createApiKeySchema = z.object({
  name: z.string().min(1).max(120),
  expiresAt: z.coerce.date().optional(),
});

@UseGuards(AuthGuard)
@Controller('api/api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  async list(@Req() req: any) {
    return this.apiKeyService.list(req.user.orgId);
  }

  @Get('default')
  async getDefault(@Req() req: any) {
    return this.apiKeyService.getDefault(req.user.orgId);
  }

  @Post()
  async create(@Req() req: any, @Body() body: unknown) {
    const { name, expiresAt } = createApiKeySchema.parse(body);
    const { key, doc } = await this.apiKeyService.create(req.user.orgId, name, expiresAt);
    return { key, ...doc };
  }

  @Delete(':id')
  async revoke(@Req() req: any, @Param('id') id: string) {
    return this.apiKeyService.revoke(req.user.orgId, id);
  }

  @Patch(':id/regenerate')
  async regenerate(@Req() req: any, @Param('id') id: string) {
    const result = await this.apiKeyService.regenerate(req.user.orgId, id);
    if (!result) return { error: 'Not found' };
    return { key: result.key, ...result.doc };
  }

  @Patch(':id/default')
  async setDefault(@Req() req: any, @Param('id') id: string) {
    return this.apiKeyService.setDefault(req.user.orgId, id);
  }
}
