import { Module } from "@nestjs/common"
import { MetricsGateway } from "./metrics.gateway.js"
import { MetricsSimulationService } from "../metrics/metrics-simulation.service.js"
import { AuthModule } from "../auth/auth.module.js"
import { AlertsModule } from "../alerts/alerts.module.js"

@Module({
  imports: [AuthModule, AlertsModule],
  providers: [MetricsGateway, MetricsSimulationService],
  exports: [MetricsGateway, MetricsSimulationService],
})
export class GatewayModule {}