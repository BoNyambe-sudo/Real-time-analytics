import { Module } from "@nestjs/common"
import { ApiKeyService } from "./api-key.service.js"
import { ApiKeyController } from "./api-key.controller.js"

@Module({
  providers: [ApiKeyService],
  controllers: [ApiKeyController],
  exports: [ApiKeyService],
})
export class ApiKeysModule {}