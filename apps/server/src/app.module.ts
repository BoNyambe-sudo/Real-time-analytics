import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { ScheduleModule } from "@nestjs/schedule"
import { ThrottlerModule } from "@nestjs/throttler"
import { MongooseModule } from "./database/mongoose.module.js"
import { MetricsModule } from "./metrics/metrics.module.js"
import { LogsModule } from "./logs/logs.module.js"
import { AlertsModule } from "./alerts/alerts.module.js"
import { ApiKeysModule } from "./api-keys/api-keys.module.js"
import { AuthModule } from "./auth/auth.module.js"
import { GatewayModule } from "./gateway/gateway.module.js"
import { RedisModule } from "./redis/redis.module.js"
import { RateLimitModule } from "./rate-limit/rate-limit.module.js"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(__dirname, "..", "..", "..", ".env") }),
    ScheduleModule.forRoot(),
    RateLimitModule,
    RedisModule,
    MongooseModule,
    AuthModule,
    GatewayModule,
    MetricsModule,
    LogsModule,
    AlertsModule,
    ApiKeysModule,
  ],
})
export class AppModule {}