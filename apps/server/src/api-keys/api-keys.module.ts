import { Module } from "@nestjs/common"
import { ApiKeyService } from "./api-key.service.js"
import { ApiKeyController } from "./api-key.controller.js"
import { AuthModule } from "../auth/auth.module.js"

@Module({
  imports: [AuthModule],
  providers: [ApiKeyService],
  controllers: [ApiKeyController],
  exports: [ApiKeyService],
})
export class ApiKeysModule {}