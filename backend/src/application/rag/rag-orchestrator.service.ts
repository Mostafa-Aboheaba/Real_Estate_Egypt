import { Inject, Injectable, Logger } from '@nestjs/common';
import { EMBEDDING_PORT, EmbeddingPort } from '../../domain/rag/ports/embedding.port';
import {
  EMBEDDING_REPOSITORY,
  EmbeddingRepositoryPort,
} from '../../domain/rag/ports/embedding-repository.port';
import {
  RagRetrieveRequest,
  RagRetrieveResult,
} from '../../domain/rag/types/rag.types';
import { RagCacheService } from '../../infrastructure/cache/rag-cache.service';
import { RagMetricsService } from '../../infrastructure/observability/rag-metrics.service';

const DEFAULT_TOP_K = 5;

@Injectable()
export class RagOrchestratorService {
  private readonly logger = new Logger(RagOrchestratorService.name);

  constructor(
    @Inject(EMBEDDING_PORT) private readonly embedder: EmbeddingPort,
    @Inject(EMBEDDING_REPOSITORY)
    private readonly embeddings: EmbeddingRepositoryPort,
    private readonly cache: RagCacheService,
    private readonly metrics: RagMetricsService,
  ) {}

  async retrieve(request: RagRetrieveRequest): Promise<RagRetrieveResult> {
    const started = Date.now();
    const topK = request.topK ?? DEFAULT_TOP_K;
    const filters = {
      city: request.filters?.city,
      governorate: request.filters?.governorate,
      listingType: request.filters?.listingType,
      propertyType: request.filters?.propertyType,
      minPriceEgp: request.filters?.minPriceEgp,
      maxPriceEgp: request.filters?.maxPriceEgp,
      includeFaq: request.filters?.includeFaq ?? true,
    };

    const cacheKey = this.cache.cacheKey(request.query, filters);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.metrics.recordRetrieve(
        Date.now() - started,
        cached.empty,
        true,
      );
      return { ...cached, durationMs: Date.now() - started, cached: true };
    }

    const queryVector = await this.embedder.embedQuery(request.query);
    const sourceTypes: Array<'property' | 'faq'> = ['property'];
    if (filters.includeFaq) {
      sourceTypes.push('faq');
    }

    const chunks = await this.embeddings.hybridRetrieve(
      queryVector,
      request.query,
      {
        city: filters.city,
        governorate: filters.governorate,
        listingType: filters.listingType,
        propertyType: filters.propertyType,
        minPriceEgp: filters.minPriceEgp,
        maxPriceEgp: filters.maxPriceEgp,
        sourceTypes,
      },
      topK,
    );

    const listingIds = [
      ...new Set(
        chunks
          .filter((c) => c.entityType === 'property')
          .map((c) => c.entityId),
      ),
    ];

    const empty = chunks.length === 0;
    if (empty) {
      this.logger.warn(`RAG empty retrieval for query="${request.query.slice(0, 80)}"`);
    }

    const result: RagRetrieveResult = {
      query: request.query,
      chunks: chunks.map((c) => ({
        id: c.id,
        entityType: c.entityType,
        entityId: c.entityId,
        listingId: c.entityType === 'property' ? c.entityId : undefined,
        content: c.content,
        score: c.score,
        metadata: c.metadata,
      })),
      listingIds,
      empty,
      cached: false,
      durationMs: Date.now() - started,
    };

    await this.cache.set(cacheKey, result);
    this.metrics.recordRetrieve(result.durationMs, empty, false);
    return result;
  }
}
