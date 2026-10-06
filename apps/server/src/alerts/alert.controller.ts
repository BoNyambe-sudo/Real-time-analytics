import { Controller, Get, Patch, Param, Body, UseGuards, Req } from "@nestjs/common"
import { AlertService } from "./alert.service.js"
import { AuthGuard } from "../auth/auth.guard.js"
import { z } from "zod"

const acknowledgeSchema = z.object({ id: z.string() })

@UseGuards(AuthGuard)
@Controller("api/alerts")
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  async getAlerts(@Req() req: any) {
    return this.alertService.getAlerts(req.user.orgId)
  }

  @Patch(":id/acknowledge")
  async acknowledge(@Req() req: any, @Param("id") id: string, @Body() body: unknown) {
    acknowledgeSchema.parse(body)
    return this.alertService.acknowledge(req.user.orgId, id)
  }
}