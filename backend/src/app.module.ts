import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { AuthModule } from './presentation/auth/auth.module';
import { ApiExceptionFilter } from './presentation/filters/api-exception.filter';
import { HealthModule } from './presentation/health/health.module';
import { TransformInterceptor } from './presentation/interceptors/transform.interceptor';
import { UsersModule } from './presentation/users/users.module';
import { PropertiesModule } from './presentation/properties/properties.module';
import { AgentsModule } from './presentation/agents/agents.module';
import { RagModule } from './presentation/ai/rag.module';
import { ChatModule } from './presentation/ai/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        autoLogging: false,
        customProps: (req) => ({
          correlationId: (req as { correlationId?: string }).correlationId,
        }),
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    HealthModule,
    QueueModule,
    AuthModule,
    UsersModule,
    AgentsModule,
    PropertiesModule,
    RagModule,
    ChatModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
