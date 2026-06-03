import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PING_JOB, PLATFORM_QUEUE } from './queue.constants';

@Processor(PLATFORM_QUEUE)
export class PingProcessor extends WorkerHost {
  private readonly logger = new Logger(PingProcessor.name);

  async process(job: Job): Promise<{ pong: boolean }> {
    if (job.name === PING_JOB) {
      this.logger.log(`Processed ${PING_JOB} job ${job.id}`);
      return { pong: true };
    }
    this.logger.warn(`Unknown job name: ${job.name}`);
    return { pong: false };
  }
}
