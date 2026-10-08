import { Module } from '@nestjs/common';
import { AlertService } from './alert.service.js';
import { AlertController } from './alert.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  providers: [AlertService],
  controllers: [AlertController],
  exports: [AlertService],
})
export class AlertsModule {}
