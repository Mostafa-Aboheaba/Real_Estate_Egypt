import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FairHousingFilter } from '../../domain/recommendation/services/fair-housing-filter';
import {
  ScoringPage,
  ScoringPort,
  ScoringQuery,
  ScoredPropertyRow,
} from '../../domain/recommendation/ports/scoring.port';
import {
  RecommendationDomainException,
  RecommendationErrorCode,
} from '../../domain/recommendation/failures/recommendation.failures';
import { PrismaService } from '../persistence/prisma/prisma.service';

const GREATER_CAIRO_GOVERNORATES = ['Cairo', 'Giza', 'Qalyubia'];

@Injectable()
export class PgvectorScoringAdapter implements ScoringPort {
  private readonly logger = new Logger(PgvectorScoringAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  async queryPersonalized(input: ScoringQuery): Promise<ScoringPage> {
    if (!input.vector?.length) {
      return this.queryPopular(input);
    }
    return this.runQuery(input, input.vector, false);
  }

  async queryPopular(input: ScoringQuery): Promise<ScoringPage> {
    return this.runQuery(input, null, true);
  }

  private async runQuery(
    input: ScoringQuery,
    vector: number[] | null,
    popularOnly: boolean,
  ): Promise<ScoringPage> {
    const offset = (input.page - 1) * input.pageSize;
    const conditions: Prisma.Sql[] = [Prisma.sql`p.is_active = true`];

    if (popularOnly) {
      conditions.push(
        Prisma.sql`p.location->>'governorate' = ANY(${GREATER_CAIRO_GOVERNORATES}::text[])`,
      );
    } else {
      conditions.push(Prisma.sql`e.entity_type = 'property'::embedding_entity_type`);
      conditions.push(Prisma.sql`e.chunk_index = 0`);
    }

    this.applySearchPreferences(conditions, input);

    if (input.excludePropertyIds.length > 0) {
      conditions.push(
        Prisma.sql`p.id != ALL(${input.excludePropertyIds}::uuid[])`,
      );
    }

    const whereClause = Prisma.join(conditions, ' AND ');

    try {
      if (popularOnly) {
        return await this.queryPopularRows(whereClause, input, offset);
      }
      const vectorLiteral = `[${vector!.join(',')}]`;
      return await this.queryVectorRows(
        whereClause,
        vectorLiteral,
        input,
        offset,
      );
    } catch (error) {
      this.logger.error(
        `Recommendation query failed: ${error instanceof Error ? error.message : error}`,
      );
      throw new RecommendationDomainException(
        RecommendationErrorCode.RECOMMENDATIONS_UNAVAILABLE,
        'Recommendation query failed',
      );
    }
  }

  private applySearchPreferences(
    conditions: Prisma.Sql[],
    input: ScoringQuery,
  ): void {
    const prefs = input.filters.searchPreferences;
    if (!prefs) {
      return;
    }
    FairHousingFilter.assertAllowedFilterKeys(Object.keys(prefs));

    if (prefs.listingType) {
      conditions.push(
        Prisma.sql`p.listing_type = ${prefs.listingType}::listing_type`,
      );
    }
    if (prefs.minPriceEgp != null) {
      conditions.push(Prisma.sql`p.price_egp >= ${prefs.minPriceEgp}`);
    }
    if (prefs.maxPriceEgp != null) {
      conditions.push(Prisma.sql`p.price_egp <= ${prefs.maxPriceEgp}`);
    }
    if (prefs.propertyTypes?.length) {
      conditions.push(
        Prisma.sql`p.property_type = ANY(${prefs.propertyTypes}::property_type[])`,
      );
    }
    if (prefs.cities?.length) {
      conditions.push(
        Prisma.sql`p.location->>'city' = ANY(${prefs.cities}::text[])`,
      );
    }
  }

  private async queryPopularRows(
    whereClause: Prisma.Sql,
    input: ScoringQuery,
    offset: number,
  ): Promise<ScoringPage> {
    const countRows = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM properties p
      WHERE ${whereClause}
    `;
    const totalItems = Number(countRows[0]?.count ?? 0);

    const rows = await this.prisma.$queryRaw<
      Array<{
        property_id: string;
        title: string;
        price_egp: Prisma.Decimal;
        listing_type: string;
        property_type: string;
        city: string;
        area: string;
        images: unknown;
      }>
    >`
      SELECT
        p.id AS property_id,
        p.title,
        p.price_egp,
        p.listing_type::text AS listing_type,
        p.property_type::text AS property_type,
        COALESCE(p.location->>'city', '') AS city,
        COALESCE(p.location->>'district', p.location->>'area', '') AS area,
        p.images
      FROM properties p
      WHERE ${whereClause}
      ORDER BY p.synced_at DESC, p.id ASC
      LIMIT ${input.pageSize}
      OFFSET ${offset}
    `;

    return {
      totalItems,
      items: rows.map((row, index) =>
        this.toScoredRow(row, popularOnlyDistance(index)),
      ),
    };
  }

  private async queryVectorRows(
    whereClause: Prisma.Sql,
    vectorLiteral: string,
    input: ScoringQuery,
    offset: number,
  ): Promise<ScoringPage> {
    const countRows = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM embeddings e
      INNER JOIN properties p ON p.id = e.entity_id
      WHERE ${whereClause}
    `;
    const totalItems = Number(countRows[0]?.count ?? 0);

    const rows = await this.prisma.$queryRaw<
      Array<{
        property_id: string;
        distance: number;
        title: string;
        price_egp: Prisma.Decimal;
        listing_type: string;
        property_type: string;
        city: string;
        area: string;
        images: unknown;
      }>
    >`
      SELECT
        p.id AS property_id,
        (e.embedding <=> ${vectorLiteral}::vector) AS distance,
        p.title,
        p.price_egp,
        p.listing_type::text AS listing_type,
        p.property_type::text AS property_type,
        COALESCE(p.location->>'city', '') AS city,
        COALESCE(p.location->>'district', p.location->>'area', '') AS area,
        p.images
      FROM embeddings e
      INNER JOIN properties p ON p.id = e.entity_id
      WHERE ${whereClause}
      ORDER BY distance ASC, p.id ASC
      LIMIT ${input.pageSize}
      OFFSET ${offset}
    `;

    return {
      totalItems,
      items: rows.map((row) =>
        this.toScoredRow(row, Number(row.distance)),
      ),
    };
  }

  private toScoredRow(
    row: {
      property_id: string;
      title: string;
      price_egp: Prisma.Decimal;
      listing_type: string;
      property_type: string;
      city: string;
      area: string;
      images: unknown;
    },
    distance: number,
  ): ScoredPropertyRow {
    const images = Array.isArray(row.images) ? (row.images as string[]) : [];
    return {
      propertyId: row.property_id,
      distance,
      title: row.title,
      priceEgp: Number(row.price_egp),
      listingType: row.listing_type,
      propertyType: row.property_type,
      city: row.city,
      area: row.area,
      thumbnailUrl: images[0] ?? null,
    };
  }
}

function popularOnlyDistance(index: number): number {
  return 0.5 + index * 0.01;
}
