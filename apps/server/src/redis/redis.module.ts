import { Global, Module, Provider } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Redis } from "@upstash/redis"

export const REDIS_CLIENT = Symbol("REDIS_CLIENT")

const createRedisProvider = (): Provider => ({
  provide: REDIS_CLIENT,
  useFactory: (configService: ConfigService) => {
    const url = configService.get<string>("UPSTASH_REDIS_REST_URL")
    const token = configService.get<string>("UPSTASH_REDIS_REST_TOKEN")
    if (!url || !token) return null
    return new Redis({ url, token })
  },
  inject: [ConfigService],
})

@Global()
@Module({
  providers: [createRedisProvider()],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}