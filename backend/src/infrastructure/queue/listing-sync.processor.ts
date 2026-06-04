import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PropertyService } from '../../application/property/property.service';
import { ListingProvider } from '../../domain/property/enums/listing-provider.enum';
import {
  LISTING_SYNC_JOB,
  LISTING_SYNC_QUEUE,
} from './queue.constants';

export interface ListingSyncJobData {
  provider: ListingProvider;
}

@Processor(LISTING_SYNC_QUEUE)
export class ListingSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(ListingSyncProcessor.name);

  constructor(private readonly propertyService: PropertyService) {
    super();
  }

  async process(job: Job<ListingSyncJobData>): Promise<void> {
    if (job.name !== LISTING_SYNC_JOB) {
      return;
    }

    const provider = job.data.provider ?? ListingProvider.Shaety;
    this.logger.log(`Processing listing sync for ${provider} (job ${job.id})`);

    await this.propertyService.runListingSync(
      provider,
      job.attemptsMade + 1,
    );
  }
}
