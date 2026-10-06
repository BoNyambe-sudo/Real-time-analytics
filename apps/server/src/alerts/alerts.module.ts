import { Module } from "@nestjs/common"
import { AlertService } from "./alert.service.js"
import { AlertController } from "./alert.controller.js"

@Module({
  providers: [AlertService],
  controllers: [AlertController],
  exports: [AlertService],
})
export class AlertsModule {}