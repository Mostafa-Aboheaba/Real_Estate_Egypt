process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/property_assistant?schema=public';
process.env.REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT ?? '6379';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-min-16-chars';

import { Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { HealthModule } from './presentation/health/health.module';
import { PrismaService } from './infrastructure/persistence/prisma/prisma.service';

@Module({})
class MockQueueModule {}

describe('Platform modules', () => {
  it('health module compiles', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
          validationSchema,
        }),
        PrismaModule,
        HealthModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
        isHealthy: jest.fn().mockResolvedValue(true),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $queryRaw: jest.fn(),
      })
      .compile();

    expect(module).toBeDefined();
    await module.close();
  });
});
