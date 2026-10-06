import { Controller, Get, Query, UseGuards, Req } from "@nestjs/common"
import { MetricsService } from "./metrics.service.js"
import { AuthGuard } from "../auth/auth.guard.js"
import { z } from "zod"

const timeseriesQuerySchema = z.object({ range: z.enum(["1h", "24h", "7d"]).default("24h") })

@UseGuards(AuthGuard)
@Controller("api/metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get("summary")
  async getSummary(@Req() req: any) {
    return this.metricsService.getSummary(req.user.orgId)
  }

  @Get("timeseries")
  async getTimeseries(@Query() query: unknown, @Req() req: any) {
    const { range } = timeseriesQuerySchema.parse(query)
    return this.metricsService.getTimeseries(req.user.orgId, range)
  }
}