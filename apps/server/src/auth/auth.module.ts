import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import { SessionAuthGuard } from './session-auth.guard.js';
import { ApiKeyGuard } from './api-key.guard.js';
import { SocketAuthGuard } from './socket-auth.guard.js';

@Module({
  providers: [AuthService, AuthGuard, SessionAuthGuard, ApiKeyGuard, SocketAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard, SessionAuthGuard, ApiKeyGuard, SocketAuthGuard],
})
export class AuthModule {}
