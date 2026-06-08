export type EmbeddingEntityType = 'property' | 'project' | 'faq';

export interface RagRetrieveRequest {
  query: string;
  topK?: number;
  filters?: {
    city?: string;
    governorate?: string;
    listingType?: string;
    propertyType?: string;
    minPriceEgp?: number;
    maxPriceEgp?: number;
    includeFaq?: boolean;
  };
}

export interface RagRetrieveResult {
  query: string;
  chunks: Array<{
    id: string;
    entityType: EmbeddingEntityType;
    entityId: string;
    listingId?: string;
    content: string;
    score: number;
    metadata: Record<string, unknown>;
  }>;
  listingIds: string[];
  empty: boolean;
  cached: boolean;
  durationMs: number;
}
