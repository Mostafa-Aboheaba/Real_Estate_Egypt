import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  EmbeddingRepositoryPort,
  EmbeddingUpsertInput,
  RagRetrievalFilters,
  RagRetrievedChunk,
} from '../../../domain/rag/ports/embedding-repository.port';
import { EmbeddingEntityType } from '../../../domain/rag/types/rag.types';
import { PrismaService } from '../prisma/prisma.service';

const VECTOR_WEIGHT = 0.7;
const TEXT_WEIGHT = 0.3;

@Injectable()
export class PrismaEmbeddingRepository implements EmbeddingRepositoryPort {
  private readonly logger = new Logger(PrismaEmbeddingRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async upsert(input: EmbeddingUpsertInput): Promise<void> {
    const vectorLiteral = `[${input.vector.join(',')}]`;
    await this.prisma.$executeRaw`
      INSERT INTO embeddings (
        entity_type, entity_id, chunk_index, content, content_hash,
        model_version, embedding, embedded_at
      ) VALUES (
        ${input.entityType}::embedding_entity_type,
        ${input.entityId}::uuid,
        ${input.chunkIndex},
        ${input.content},
        ${input.contentHash},
        ${input.modelVersion ?? 'text-embedding-004'},
        ${vectorLiteral}::vector,
        NOW()
      )
      ON CONFLICT (entity_type, entity_id, chunk_index)
      DO UPDATE SET
        content = EXCLUDED.content,
        content_hash = EXCLUDED.content_hash,
        model_version = EXCLUDED.model_version,
        embedding = EXCLUDED.embedding,
        embedded_at = NOW()
    `;
  }

  async deleteByEntity(
    entityType: EmbeddingEntityType,
    entityId: string,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM embeddings
      WHERE entity_type = ${entityType}::embedding_entity_type
        AND entity_id = ${entityId}::uuid
    `;
  }

  async findContentHash(
    entityType: EmbeddingEntityType,
    entityId: string,
    chunkIndex: number,
  ): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<Array<{ content_hash: string }>>`
      SELECT content_hash FROM embeddings
      WHERE entity_type = ${entityType}::embedding_entity_type
        AND entity_id = ${entityId}::uuid
        AND chunk_index = ${chunkIndex}
      LIMIT 1
    `;
    return rows[0]?.content_hash ?? null;
  }

  async hybridRetrieve(
    queryVector: number[],
    queryText: string,
    filters: RagRetrievalFilters,
    topK: number,
  ): Promise<RagRetrievedChunk[]> {
    const vectorLiteral = `[${queryVector.join(',')}]`;
    const sources = filters.sourceTypes ?? ['property', 'faq'];
    const chunks: RagRetrievedChunk[] = [];

    if (sources.includes('property')) {
      const propertyRows = await this.retrieveProperties(
        vectorLiteral,
        queryText,
        filters,
        topK,
      );
      chunks.push(...propertyRows);
    }

    if (sources.includes('faq')) {
      const faqRows = await this.retrieveFaqChunks(
        vectorLiteral,
        queryText,
        topK,
      );
      chunks.push(...faqRows);
    }

    return chunks
      .sort((a, b) => a.score - b.score)
      .slice(0, topK);
  }

  async listActivePropertyIdsMissingEmbedding(
    limit: number,
  ): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT p.id
      FROM properties p
      LEFT JOIN embeddings e
        ON e.entity_type = 'property'::embedding_entity_type
        AND e.entity_id = p.id
        AND e.chunk_index = 0
      WHERE p.is_active = true AND e.id IS NULL
      LIMIT ${limit}
    `;
    return rows.map((r) => r.id);
  }

  private async retrieveProperties(
    vectorLiteral: string,
    queryText: string,
    filters: RagRetrievalFilters,
    topK: number,
  ): Promise<RagRetrievedChunk[]> {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`p.is_active = true`,
      Prisma.sql`e.entity_type = 'property'::embedding_entity_type`,
      Prisma.sql`e.chunk_index = 0`,
    ];

    if (filters.city) {
      conditions.push(
        Prisma.sql`p.location->>'city' = ${filters.city}`,
      );
    }
    if (filters.governorate) {
      conditions.push(
        Prisma.sql`p.location->>'governorate' = ${filters.governorate}`,
      );
    }
    if (filters.listingType) {
      conditions.push(
        Prisma.sql`p.listing_type = ${filters.listingType}::listing_type`,
      );
    }
    if (filters.minPriceEgp != null) {
      conditions.push(Prisma.sql`p.price_egp >= ${filters.minPriceEgp}`);
    }
    if (filters.maxPriceEgp != null) {
      conditions.push(Prisma.sql`p.price_egp <= ${filters.maxPriceEgp}`);
    }

    const whereClause = Prisma.join(conditions, ' AND ');
    const q = queryText.trim() || 'property';

    const rows = await this.prisma.$queryRaw<
      Array<{
        chunk_id: string;
        entity_id: string;
        content: string;
        vector_distance: number;
        text_rank: number;
        title: string;
        price_egp: Prisma.Decimal;
        listing_type: string;
        city: string;
        governorate: string;
      }>
    >`
      SELECT
        e.id AS chunk_id,
        e.entity_id,
        e.content,
        (e.embedding <=> ${vectorLiteral}::vector) AS vector_distance,
        COALESCE(
          ts_rank(p.search_vector, plainto_tsquery('simple', ${q})),
          0
        ) AS text_rank,
        p.title,
        p.price_egp,
        p.listing_type::text AS listing_type,
        p.location->>'city' AS city,
        p.location->>'governorate' AS governorate
      FROM embeddings e
      INNER JOIN properties p ON p.id = e.entity_id
      WHERE ${whereClause}
      ORDER BY (
        ${VECTOR_WEIGHT} * (e.embedding <=> ${vectorLiteral}::vector)
        + ${TEXT_WEIGHT} * (1 - COALESCE(
          ts_rank(p.search_vector, plainto_tsquery('simple', ${q})),
          0
        ))
      ) ASC
      LIMIT ${topK}
    `;

    return rows.map((row) => {
      const score =
        VECTOR_WEIGHT * Number(row.vector_distance) +
        TEXT_WEIGHT * (1 - Number(row.text_rank));
      return {
        id: row.chunk_id,
        entityType: 'property' as const,
        entityId: row.entity_id,
        content: row.content,
        score,
        vectorDistance: Number(row.vector_distance),
        textRank: Number(row.text_rank),
        metadata: {
          source_type: 'property',
          listing_id: row.entity_id,
          title: row.title,
          price_egp: Number(row.price_egp),
          listing_type: row.listing_type,
          city: row.city,
          governorate: row.governorate,
        },
      };
    });
  }

  private async retrieveFaqChunks(
    vectorLiteral: string,
    queryText: string,
    topK: number,
  ): Promise<RagRetrievedChunk[]> {
    const q = queryText.trim() || 'help';

    try {
      const rows = await this.prisma.$queryRaw<
        Array<{
          chunk_id: string;
          entity_id: string;
          content: string;
          vector_distance: number;
          text_rank: number;
          category: string | null;
          locale: string | null;
        }>
      >`
        SELECT
          e.id AS chunk_id,
          e.entity_id,
          e.content,
          (e.embedding <=> ${vectorLiteral}::vector) AS vector_distance,
          COALESCE(
            ts_rank(to_tsvector('simple', e.content), plainto_tsquery('simple', ${q})),
            0
          ) AS text_rank,
          NULL::text AS category,
          NULL::text AS locale
        FROM embeddings e
        WHERE e.entity_type = 'faq'::embedding_entity_type
        ORDER BY (
          ${VECTOR_WEIGHT} * (e.embedding <=> ${vectorLiteral}::vector)
          + ${TEXT_WEIGHT} * (1 - COALESCE(
            ts_rank(to_tsvector('simple', e.content), plainto_tsquery('simple', ${q})),
            0
          ))
        ) ASC
        LIMIT ${topK}
      `;

      return rows.map((row) => ({
        id: row.chunk_id,
        entityType: 'faq' as const,
        entityId: row.entity_id,
        content: row.content,
        score:
          VECTOR_WEIGHT * Number(row.vector_distance) +
          TEXT_WEIGHT * (1 - Number(row.text_rank)),
        vectorDistance: Number(row.vector_distance),
        textRank: Number(row.text_rank),
        metadata: {
          source_type: 'faq',
          category: row.category,
          locale: row.locale,
        },
      }));
    } catch (error) {
      this.logger.warn(
        `FAQ retrieval skipped: ${error instanceof Error ? error.message : error}`,
      );
      return [];
    }
  }
}
