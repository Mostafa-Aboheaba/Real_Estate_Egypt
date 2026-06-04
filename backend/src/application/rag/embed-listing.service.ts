import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { PROPERTY_REPOSITORY } from '../../domain/property/ports/property.repository.port';
import type { PropertyRepositoryPort } from '../../domain/property/ports/property.repository.port';
import {
  buildPropertyEmbeddingText,
  propertyEmbeddingMetadata,
} from '../../domain/rag/property-embedding-text';
import { EMBEDDING_MODEL_VERSION } from '../../domain/rag/ports/embedding.port';
import { EMBEDDING_PORT, EmbeddingPort } from '../../domain/rag/ports/embedding.port';
import {
  EMBEDDING_REPOSITORY,
  EmbeddingRepositoryPort,
} from '../../domain/rag/ports/embedding-repository.port';
import { RagCacheService } from '../../infrastructure/cache/rag-cache.service';
import { RagMetricsService } from '../../infrastructure/observability/rag-metrics.service';

@Injectable()
export class EmbedListingService {
  private readonly logger = new Logger(EmbedListingService.name);

  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly properties: PropertyRepositoryPort,
    @Inject(EMBEDDING_REPOSITORY)
    private readonly embeddings: EmbeddingRepositoryPort,
    @Inject(EMBEDDING_PORT) private readonly embedder: EmbeddingPort,
    private readonly ragCache: RagCacheService,
    private readonly metrics: RagMetricsService,
  ) {}

  async embedProperty(propertyId: string): Promise<boolean> {
    const started = Date.now();
    const property = await this.properties.findById(propertyId);
    if (!property?.id) {
      this.logger.warn(`Skip embed — property ${propertyId} not found or inactive`);
      return false;
    }

    const content = buildPropertyEmbeddingText(property);
    const contentHash = createHash('sha256').update(content).digest('hex');
    const existing = await this.embeddings.findContentHash(
      'property',
      property.id,
      0,
    );
    if (existing === contentHash) {
      return false;
    }

    const [vector] = await this.embedder.embedTexts([content]);
    await this.embeddings.upsert({
      entityType: 'property',
      entityId: property.id,
      chunkIndex: 0,
      content,
      contentHash,
      vector,
      modelVersion: EMBEDDING_MODEL_VERSION,
    });

    await this.ragCache.invalidateOnListingUpdate();
    this.metrics.recordEmbed(Date.now() - started);
    this.logger.debug(`Embedded property ${property.id}`);
    return true;
  }

  async embedMissingBatch(limit = 50): Promise<number> {
    const ids = await this.embeddings.listActivePropertyIdsMissingEmbedding(
      limit,
    );
    let count = 0;
    for (const id of ids) {
      const embedded = await this.embedProperty(id);
      if (embedded) {
        count += 1;
      }
    }
    return count;
  }
}
