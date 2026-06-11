import { Injectable } from '@nestjs/common';
import {
  PreferenceVectorRecord,
  PreferenceVectorRepositoryPort,
} from '../../../domain/recommendation/ports/preference-vector.repository.port';
import {
  PREFERENCE_VECTOR_DIM,
  PreferenceVector,
} from '../../../domain/recommendation/value-objects/preference-vector.vo';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaPreferenceVectorRepository
  implements PreferenceVectorRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<PreferenceVectorRecord | null> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        user_id: string;
        signal_count: number;
        model_version: string;
        computed_at: Date;
        embedding: string;
      }>
    >`
      SELECT user_id, signal_count, model_version, computed_at,
             embedding::text AS embedding
      FROM user_preference_vectors
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) {
      return null;
    }
    const values = parseVectorText(row.embedding);
    const vector = PreferenceVector.create(
      values,
      row.signal_count,
      row.model_version,
    );
    if (!vector) {
      return null;
    }
    return {
      userId: row.user_id,
      vector,
      computedAt: row.computed_at,
    };
  }

  async upsert(
    userId: string,
    vector: number[],
    signalCount: number,
    modelVersion: string,
  ): Promise<void> {
    const literal = `[${vector.join(',')}]`;
    await this.prisma.$executeRaw`
      INSERT INTO user_preference_vectors (
        user_id, embedding, signal_count, model_version, computed_at
      ) VALUES (
        ${userId}::uuid,
        ${literal}::vector,
        ${signalCount},
        ${modelVersion},
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        embedding = EXCLUDED.embedding,
        signal_count = EXCLUDED.signal_count,
        model_version = EXCLUDED.model_version,
        computed_at = EXCLUDED.computed_at
    `;
  }

  async listEmbeddingsForPropertyIds(
    propertyIds: string[],
  ): Promise<Array<{ propertyId: string; vector: number[] }>> {
    if (propertyIds.length === 0) {
      return [];
    }
    const rows = await this.prisma.$queryRaw<
      Array<{ entity_id: string; embedding: string }>
    >`
      SELECT entity_id, embedding::text AS embedding
      FROM embeddings
      WHERE entity_type = 'property'::embedding_entity_type
        AND chunk_index = 0
        AND entity_id = ANY(${propertyIds}::uuid[])
    `;
    return rows.map((row) => ({
      propertyId: row.entity_id,
      vector: parseVectorText(row.embedding),
    }));
  }
}

function parseVectorText(text: string): number[] {
  const trimmed = text.replace(/^\[/, '').replace(/\]$/, '');
  if (!trimmed) {
    return Array.from({ length: PREFERENCE_VECTOR_DIM }, () => 0);
  }
  return trimmed.split(',').map((v) => Number.parseFloat(v.trim()));
}
