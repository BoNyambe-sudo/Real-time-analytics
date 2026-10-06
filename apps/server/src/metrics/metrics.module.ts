import { Module } from "@nestjs/common"
import { MetricsService } from "./metrics.service.js"
import { MetricsController } from "./metrics.controller.js"
import { MetricsSimulationService } from "./metrics-simulation.service.js"

@Module({
  providers: [MetricsService, MetricsSimulationService],
  controllers: [MetricsController],
  exports: [MetricsService, MetricsSimulationService],
})
export class MetricsModule {}