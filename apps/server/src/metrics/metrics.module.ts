import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service.js';
import { MetricsController } from './metrics.controller.js';
import { MetricsSimulationService } from './metrics-simulation.service.js';
import { AlertsModule } from '../alerts/alerts.module.js';
import { GatewayModule } from '../gateway/gateway.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AlertsModule, GatewayModule, AuthModule],
  providers: [MetricsService, MetricsSimulationService],
  controllers: [MetricsController],
  exports: [MetricsService, MetricsSimulationService],
})
export class MetricsModule {}
