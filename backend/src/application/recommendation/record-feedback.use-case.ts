import { Inject, Injectable, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import {
  RecommendationDomainException,
  RecommendationErrorCode,
} from '../../domain/recommendation/failures/recommendation.failures';
import {
  FEEDBACK_REPOSITORY,
  FeedbackRepositoryPort,
} from '../../domain/recommendation/ports/feedback.repository.port';
import { FeedbackSentiment } from '../../domain/recommendation/value-objects/feedback-sentiment.vo';
import { BuildPreferenceVectorUseCase } from './build-preference-vector.use-case';
import {
  RECOMMENDATIONS_RECOMPUTE_JOB,
  RECOMMENDATIONS_QUEUE,
} from '../../infrastructure/queue/queue.constants';

export interface RecordFeedbackResult {
  feedbackId: string;
  propertyId: string;
  sentiment: FeedbackSentiment;
  recorded: boolean;
  created: boolean;
}

@Injectable()
export class RecordFeedbackUseCase {
  constructor(
    @Inject(FEEDBACK_REPOSITORY)
    private readonly feedback: FeedbackRepositoryPort,
    private readonly buildVector: BuildPreferenceVectorUseCase,
    private readonly prisma: PrismaService,
    @Optional()
    @InjectQueue(RECOMMENDATIONS_QUEUE)
    private readonly recomputeQueue?: Queue,
  ) {}

  async execute(
    userId: string,
    propertyId: string,
    sentiment: FeedbackSentiment,
  ): Promise<RecordFeedbackResult> {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, isActive: true },
    });
    if (!property) {
      throw new RecommendationDomainException(
        RecommendationErrorCode.PROPERTY_NOT_FOUND,
        'Property not found or inactive',
      );
    }

    const { record, created } = await this.feedback.upsert(
      userId,
      propertyId,
      sentiment,
    );

    await this.enqueueRecompute(userId);

    return {
      feedbackId: record.id,
      propertyId: record.propertyId,
      sentiment: record.sentiment,
      recorded: true,
      created,
    };
  }

  private async enqueueRecompute(userId: string): Promise<void> {
    if (this.recomputeQueue) {
      await this.recomputeQueue.add(RECOMMENDATIONS_RECOMPUTE_JOB, {
        userId,
      });
      return;
    }
    await this.buildVector.execute(userId);
  }
}
