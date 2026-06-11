import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BuildPreferenceVectorUseCase } from '../../application/recommendation/build-preference-vector.use-case';
import {
  RECOMMENDATIONS_QUEUE,
  RECOMMENDATIONS_RECOMPUTE_JOB,
} from './queue.constants';

export interface RecommendationsRecomputeJobData {
  userId: string;
}

@Processor(RECOMMENDATIONS_QUEUE)
export class RecommendationsRecomputeProcessor extends WorkerHost {
  private readonly logger = new Logger(RecommendationsRecomputeProcessor.name);

  constructor(private readonly buildVector: BuildPreferenceVectorUseCase) {
    super();
  }

  async process(job: Job<RecommendationsRecomputeJobData>): Promise<void> {
    if (job.name !== RECOMMENDATIONS_RECOMPUTE_JOB) {
      return;
    }
    await this.buildVector.execute(job.data.userId);
    this.logger.log(`Recomputed preference vector for ${job.data.userId}`);
  }
}
