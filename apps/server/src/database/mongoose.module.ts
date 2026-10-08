import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';

export const MONGOOSE_CONNECTION = Symbol('MONGOOSE_CONNECTION');

@Global()
@Module({
  providers: [
    {
      provide: MONGOOSE_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in environment variables');
        }
        const conn = await mongoose.connect(uri);
        console.log('MongoDB connected');
        return conn;
      },
      inject: [ConfigService],
    },
  ],
  exports: [MONGOOSE_CONNECTION],
})
export class MongooseModule {}
