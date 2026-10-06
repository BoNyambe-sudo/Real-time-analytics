import { Controller, Get, Query, UseGuards, Req } from "@nestjs/common"
import { EventLogService } from "./event-log.service.js"
import { AuthGuard } from "../auth/auth.guard.js"

@UseGuards(AuthGuard)
@Controller("api/logs")
export class EventLogController {
  constructor(private readonly eventLogService: EventLogService) {}

  @Get()
  async getLogs(
    @Req() req: any,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
    @Query("sort") sort?: "asc" | "desc",
    @Query("level") level?: "info" | "warn" | "error",
    @Query("q") q?: string
  ) {
    return this.eventLogService.getLogs(req.user.orgId, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      sort,
      level,
      q,
    })
  }
}