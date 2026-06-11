import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { PropertiesModule } from './presentation/properties/properties.module';
import { BookingsModule } from './presentation/booking/bookings.module';
import { RagModule } from './presentation/ai/rag.module';
import { ChatModule } from './presentation/ai/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    PrismaModule,
    QueueModule,
    RagModule,
    ChatModule,
    PropertiesModule,
    BookingsModule,
  ],
})
export class WorkerModule {}
