import { Module } from "@nestjs/common"
import { MetricsGateway } from "./metrics.gateway.js"
import { MetricsSimulationService } from "../metrics/metrics-simulation.service.js"

@Module({
  providers: [MetricsGateway, MetricsSimulationService],
  exports: [MetricsGateway, MetricsSimulationService],
})
export class GatewayModule {}