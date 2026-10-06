import { Global, Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import mongoose from "mongoose"

export const MONGOOSE_CONNECTION = Symbol("MONGOOSE_CONNECTION")

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MONGOOSE_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>("MONGODB_URI")!
        const conn = await mongoose.connect(uri)
        console.log("MongoDB connected")
        return conn
      },
      inject: [ConfigService],
    },
  ],
  exports: [MONGOOSE_CONNECTION],
})
export class MongooseModule {}