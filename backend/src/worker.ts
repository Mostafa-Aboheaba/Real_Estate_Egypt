import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Worker');
  await NestFactory.createApplicationContext(WorkerModule);
  logger.log('BullMQ worker started');
}

bootstrap();
