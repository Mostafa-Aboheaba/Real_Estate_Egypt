import { EmbeddingEntityType } from '../types/rag.types';

export const EMBEDDING_REPOSITORY = Symbol('EMBEDDING_REPOSITORY');

export interface EmbeddingUpsertInput {
  entityType: EmbeddingEntityType;
  entityId: string;
  chunkIndex: number;
  content: string;
  contentHash: string;
  vector: number[];
  modelVersion?: string;
}

export interface RagRetrievalFilters {
  city?: string;
  governorate?: string;
  listingType?: string;
  propertyType?: string;
  minPriceEgp?: number;
  maxPriceEgp?: number;
  sourceTypes?: EmbeddingEntityType[];
}

export interface RagRetrievedChunk {
  id: string;
  entityType: EmbeddingEntityType;
  entityId: string;
  content: string;
  score: number;
  vectorDistance: number;
  textRank: number;
  metadata: Record<string, unknown>;
}

export interface EmbeddingRepositoryPort {
  upsert(input: EmbeddingUpsertInput): Promise<void>;
  deleteByEntity(
    entityType: EmbeddingEntityType,
    entityId: string,
  ): Promise<void>;
  findContentHash(
    entityType: EmbeddingEntityType,
    entityId: string,
    chunkIndex: number,
  ): Promise<string | null>;
  hybridRetrieve(
    queryVector: number[],
    queryText: string,
    filters: RagRetrievalFilters,
    topK: number,
  ): Promise<RagRetrievedChunk[]>;
  listActivePropertyIdsMissingEmbedding(limit: number): Promise<string[]>;
}
