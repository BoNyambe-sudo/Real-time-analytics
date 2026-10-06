import { Module } from "@nestjs/common"
import { EventLogService } from "./event-log.service.js"
import { EventLogController } from "./event-log.controller.js"

@Module({
  providers: [EventLogService],
  controllers: [EventLogController],
  exports: [EventLogService],
})
export class LogsModule {}