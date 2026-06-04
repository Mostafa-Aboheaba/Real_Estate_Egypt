import { Injectable } from '@nestjs/common';

@Injectable()
export class RagMetricsService {
  private retrieveCount = 0;
  private retrieveEmptyCount = 0;
  private retrieveDurationMsTotal = 0;
  private embedCount = 0;
  private embedLagMsTotal = 0;
  private cacheHitCount = 0;

  recordRetrieve(durationMs: number, empty: boolean, cached: boolean): void {
    this.retrieveCount += 1;
    this.retrieveDurationMsTotal += durationMs;
    if (empty) {
      this.retrieveEmptyCount += 1;
    }
    if (cached) {
      this.cacheHitCount += 1;
    }
  }

  recordEmbed(lagMs: number): void {
    this.embedCount += 1;
    this.embedLagMsTotal += lagMs;
  }

  toPrometheus(): string {
    const emptyRate =
      this.retrieveCount > 0
        ? this.retrieveEmptyCount / this.retrieveCount
        : 0;
    const avgRetrieve =
      this.retrieveCount > 0
        ? this.retrieveDurationMsTotal / this.retrieveCount
        : 0;
    const avgEmbedLag =
      this.embedCount > 0 ? this.embedLagMsTotal / this.embedCount : 0;

    return [
      '# HELP ai_rag_retrieve_total RAG retrieve requests',
      '# TYPE ai_rag_retrieve_total counter',
      `ai_rag_retrieve_total ${this.retrieveCount}`,
      '# HELP ai_rag_retrieve_empty_total Empty RAG retrievals',
      '# TYPE ai_rag_retrieve_empty_total counter',
      `ai_rag_retrieve_empty_total ${this.retrieveEmptyCount}`,
      '# HELP ai_rag_retrieve_empty_rate Empty retrieval rate',
      '# TYPE ai_rag_retrieve_empty_rate gauge',
      `ai_rag_retrieve_empty_rate ${emptyRate}`,
      '# HELP ai_rag_retrieve_duration_ms_avg Average retrieve latency ms',
      '# TYPE ai_rag_retrieve_duration_ms_avg gauge',
      `ai_rag_retrieve_duration_ms_avg ${avgRetrieve}`,
      '# HELP ai_rag_cache_hit_total RAG cache hits',
      '# TYPE ai_rag_cache_hit_total counter',
      `ai_rag_cache_hit_total ${this.cacheHitCount}`,
      '# HELP ai_rag_embed_total Listing embeddings completed',
      '# TYPE ai_rag_embed_total counter',
      `ai_rag_embed_total ${this.embedCount}`,
      '# HELP ai_rag_embed_lag_ms_avg Average embed pipeline lag ms',
      '# TYPE ai_rag_embed_lag_ms_avg gauge',
      `ai_rag_embed_lag_ms_avg ${avgEmbedLag}`,
      '',
    ].join('\n');
  }
}
