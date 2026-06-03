import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PingProcessor } from './ping.processor';
import { PLATFORM_QUEUE } from './queue.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: PLATFORM_QUEUE }),
  ],
  providers: [PingProcessor],
  exports: [BullModule],
})
export class QueueModule {}
