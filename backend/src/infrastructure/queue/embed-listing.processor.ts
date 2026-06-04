import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmbedListingService } from '../../application/rag/embed-listing.service';
import {
  EMBED_LISTING_JOB,
  EMBED_LISTING_QUEUE,
} from './queue.constants';

export interface EmbedListingJobData {
  propertyId?: string;
  batchMissing?: boolean;
}

@Processor(EMBED_LISTING_QUEUE)
export class EmbedListingProcessor extends WorkerHost {
  private readonly logger = new Logger(EmbedListingProcessor.name);

  constructor(private readonly embedListing: EmbedListingService) {
    super();
  }

  async process(job: Job<EmbedListingJobData>): Promise<void> {
    if (job.name !== EMBED_LISTING_JOB) {
      return;
    }

    if (job.data.propertyId) {
      await this.embedListing.embedProperty(job.data.propertyId);
      return;
    }

    if (job.data.batchMissing) {
      const count = await this.embedListing.embedMissingBatch(100);
      this.logger.log(`Batch embed: ${count} properties (job ${job.id})`);
    }
  }
}
