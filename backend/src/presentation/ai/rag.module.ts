import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EmbedListingService } from '../../application/rag/embed-listing.service';
import { RagOrchestratorService } from '../../application/rag/rag-orchestrator.service';
import { EMBEDDING_PORT } from '../../domain/rag/ports/embedding.port';
import { EMBEDDING_REPOSITORY } from '../../domain/rag/ports/embedding-repository.port';
import { GeminiEmbeddingService } from '../../infrastructure/ai/gemini-embedding.service';
import { RagCacheService } from '../../infrastructure/cache/rag-cache.service';
import { FaqIngestService } from '../../infrastructure/knowledge/faq-ingest.service';
import { RagMetricsService } from '../../infrastructure/observability/rag-metrics.service';
import { PrismaEmbeddingRepository } from '../../infrastructure/persistence/rag/prisma-embedding.repository';
import { EmbedListingProcessor } from '../../infrastructure/queue/embed-listing.processor';
import { PropertiesModule } from '../properties/properties.module';
import { EMBED_LISTING_QUEUE } from '../../infrastructure/queue/queue.constants';
import { QueueModule } from '../../infrastructure/queue/queue.module';
import { AuthModule } from '../auth/auth.module';
import { MetricsController } from '../metrics/metrics.controller';
import { RagController } from './rag.controller';

@Module({
  imports: [
    QueueModule,
    AuthModule,
    BullModule.registerQueue({ name: EMBED_LISTING_QUEUE }),
  ],
  controllers: [RagController, MetricsController],
  providers: [
    RagOrchestratorService,
    EmbedListingService,
    RagCacheService,
    RagMetricsService,
    FaqIngestService,
    EmbedListingProcessor,
    GeminiEmbeddingService,
    { provide: EMBEDDING_PORT, useClass: GeminiEmbeddingService },
    { provide: EMBEDDING_REPOSITORY, useClass: PrismaEmbeddingRepository },
  ],
  exports: [
    RagOrchestratorService,
    EmbedListingService,
    EMBEDDING_REPOSITORY,
    EMBEDDING_PORT,
  ],
})
export class RagModule {}
