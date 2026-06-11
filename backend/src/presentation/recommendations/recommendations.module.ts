import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BuildPreferenceVectorUseCase } from '../../application/recommendation/build-preference-vector.use-case';
import { GetRecommendationsUseCase } from '../../application/recommendation/get-recommendations.use-case';
import { RecordFeedbackUseCase } from '../../application/recommendation/record-feedback.use-case';
import { FEEDBACK_REPOSITORY } from '../../domain/recommendation/ports/feedback.repository.port';
import { PREFERENCE_VECTOR_REPOSITORY } from '../../domain/recommendation/ports/preference-vector.repository.port';
import { SCORING_PORT } from '../../domain/recommendation/ports/scoring.port';
import { SIGNALS_PORT } from '../../domain/recommendation/ports/signals.port';
import { PrismaFeedbackRepository } from '../../infrastructure/persistence/recommendation/prisma-feedback.repository';
import { PrismaPreferenceVectorRepository } from '../../infrastructure/persistence/recommendation/prisma-preference-vector.repository';
import { PrismaSignalsAdapter } from '../../infrastructure/persistence/recommendation/prisma-signals.adapter';
import { RecommendationsRecomputeProcessor } from '../../infrastructure/queue/recommendations-recompute.processor';
import { RECOMMENDATIONS_QUEUE } from '../../infrastructure/queue/queue.constants';
import { PgvectorScoringAdapter } from '../../infrastructure/vector/pgvector-scoring.adapter';
import { AuthModule } from '../auth/auth.module';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';
import { RecommendationsController } from './recommendations.controller';

@Module({
  imports: [AuthModule, BullModule.registerQueue({ name: RECOMMENDATIONS_QUEUE })],
  controllers: [RecommendationsController],
  providers: [
    GetRecommendationsUseCase,
    RecordFeedbackUseCase,
    BuildPreferenceVectorUseCase,
    RecommendationsRecomputeProcessor,
    OptionalJwtAuthGuard,
    { provide: FEEDBACK_REPOSITORY, useClass: PrismaFeedbackRepository },
    {
      provide: PREFERENCE_VECTOR_REPOSITORY,
      useClass: PrismaPreferenceVectorRepository,
    },
    { provide: SIGNALS_PORT, useClass: PrismaSignalsAdapter },
    { provide: SCORING_PORT, useClass: PgvectorScoringAdapter },
  ],
  exports: [GetRecommendationsUseCase, RecordFeedbackUseCase],
})
export class RecommendationsModule {}
