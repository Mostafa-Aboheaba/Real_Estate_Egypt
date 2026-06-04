import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Property } from '../../../domain/property/entities/property.entity';
import { ListingProvider } from '../../../domain/property/enums/listing-provider.enum';
import {
  PaginatedProperties,
  PropertyRepositoryPort,
  PropertySearchFilters,
  ProviderSyncStats,
} from '../../../domain/property/ports/property.repository.port';
import { PrismaService } from '../prisma/prisma.service';
import {
  normalizeSearchFilters,
  toDomainProperty,
  toListItem,
  toPrismaUpsertData,
} from './property.mapper';

@Injectable()
export class PrismaPropertyRepository implements PropertyRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsertMany(properties: Property[]): Promise<number> {
    let count = 0;
    for (const property of properties) {
      const data = toPrismaUpsertData(property);
      await this.prisma.property.upsert({
        where: {
          provider_externalId: {
            provider: property.provider,
            externalId: property.externalId,
          },
        },
        create: data,
        update: {
          ...data,
          isActive: true,
        },
      });
      count += 1;
    }
    return count;
  }

  async deactivateStale(
    provider: ListingProvider,
    olderThan: Date,
  ): Promise<number> {
    const result = await this.prisma.property.updateMany({
      where: {
        provider,
        isActive: true,
        syncedAt: { lt: olderThan },
      },
      data: { isActive: false },
    });
    return result.count;
  }

  async findById(id: string): Promise<Property | null> {
    const row = await this.prisma.property.findFirst({
      where: { id, isActive: true },
    });
    return row ? toDomainProperty(row) : null;
  }

  async search(filters: PropertySearchFilters): Promise<PaginatedProperties> {
    const normalized = normalizeSearchFilters(filters);

    if (normalized.q?.trim()) {
      return this.searchFullText(normalized);
    }

    return this.searchPrisma(normalized);
  }

  async countByProvider(): Promise<ProviderSyncStats[]> {
    const providers = Object.values(ListingProvider);
    const stats: ProviderSyncStats[] = [];

    for (const provider of providers) {
      const [listingCount, activeListingCount] = await Promise.all([
        this.prisma.property.count({ where: { provider } }),
        this.prisma.property.count({
          where: { provider, isActive: true },
        }),
      ]);
      stats.push({ provider, listingCount, activeListingCount });
    }

    return stats;
  }

  private async searchPrisma(
    filters: ReturnType<typeof normalizeSearchFilters>,
  ): Promise<PaginatedProperties> {
    const where = this.buildWhereClause(filters);
    const orderBy = this.buildOrderBy(filters.sort, false);
    const skip = (filters.page - 1) * filters.pageSize;

    const [rows, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: filters.pageSize,
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      items: rows.map(toListItem),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  private async searchFullText(
    filters: ReturnType<typeof normalizeSearchFilters>,
  ): Promise<PaginatedProperties> {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`p.is_active = true`,
      Prisma.sql`p.search_vector @@ plainto_tsquery('simple', ${filters.q!.trim()})`,
    ];

    this.appendFilterSql(conditions, filters);

    const whereClause = Prisma.join(conditions, ' AND ');
    const orderSql = this.buildOrderSql(filters.sort, filters.q);
    const skip = (filters.page - 1) * filters.pageSize;

    const [rows, countRows] = await Promise.all([
      this.prisma.$queryRaw<
        Array<{
          id: string;
          title: string;
          price_egp: Prisma.Decimal;
          listing_type: string;
          property_type: string;
          bedrooms: number | null;
          bathrooms: number | null;
          area_sqm: Prisma.Decimal | null;
          location: unknown;
          images: unknown;
          provider: string;
          synced_at: Date;
        }>
      >`
        SELECT p.id, p.title, p.price_egp, p.listing_type, p.property_type,
               p.bedrooms, p.bathrooms, p.area_sqm, p.location, p.images,
               p.provider, p.synced_at
        FROM properties p
        WHERE ${whereClause}
        ORDER BY ${orderSql}
        LIMIT ${filters.pageSize} OFFSET ${skip}
      `,
      this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
        FROM properties p
        WHERE ${whereClause}
      `,
    ]);

    const total = Number(countRows[0]?.count ?? 0);

    return {
      items: rows.map((row) => {
        const location = row.location as {
          governorate: string;
          city: string;
          district: string;
        };
        const images = (row.images as string[]) ?? [];
        return {
          id: row.id,
          title: row.title,
          priceEgp: Number(row.price_egp),
          listingType: row.listing_type as Property['listingType'],
          propertyType: row.property_type as Property['propertyType'],
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          areaSqm: row.area_sqm != null ? Number(row.area_sqm) : null,
          location,
          thumbnailUrl: images[0] ?? null,
          provider: row.provider as ListingProvider,
          syncedAt: row.synced_at,
        };
      }),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  private buildWhereClause(
    filters: ReturnType<typeof normalizeSearchFilters>,
  ): Prisma.PropertyWhereInput {
    const and: Prisma.PropertyWhereInput[] = [{ isActive: true }];

    if (filters.governorate) {
      and.push({
        location: { path: ['governorate'], equals: filters.governorate },
      });
    }
    if (filters.city) {
      and.push({ location: { path: ['city'], equals: filters.city } });
    }
    if (filters.district) {
      and.push({
        location: { path: ['district'], equals: filters.district },
      });
    }

    const where: Prisma.PropertyWhereInput = { AND: and };
    if (filters.minPrice != null || filters.maxPrice != null) {
      where.priceEgp = {
        ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
      };
    }
    if (filters.propertyType) {
      where.propertyType = filters.propertyType;
    }
    if (filters.listingType) {
      where.listingType = filters.listingType;
    }
    if (filters.provider) {
      where.provider = filters.provider;
    }
    if (filters.minBedrooms != null) {
      where.bedrooms = { gte: filters.minBedrooms };
    }
    if (filters.maxBedrooms != null) {
      where.bedrooms = {
        ...(typeof where.bedrooms === 'object' ? where.bedrooms : {}),
        lte: filters.maxBedrooms,
      };
    }
    if (filters.minBathrooms != null) {
      where.bathrooms = { gte: filters.minBathrooms };
    }
    if (filters.maxBathrooms != null) {
      where.bathrooms = {
        ...(typeof where.bathrooms === 'object' ? where.bathrooms : {}),
        lte: filters.maxBathrooms,
      };
    }
    if (filters.minAreaSqm != null || filters.maxAreaSqm != null) {
      where.areaSqm = {
        ...(filters.minAreaSqm != null ? { gte: filters.minAreaSqm } : {}),
        ...(filters.maxAreaSqm != null ? { lte: filters.maxAreaSqm } : {}),
      };
    }

    return where;
  }

  private appendFilterSql(
    conditions: Prisma.Sql[],
    filters: ReturnType<typeof normalizeSearchFilters>,
  ): void {
    if (filters.governorate) {
      conditions.push(
        Prisma.sql`p.location->>'governorate' = ${filters.governorate}`,
      );
    }
    if (filters.city) {
      conditions.push(Prisma.sql`p.location->>'city' = ${filters.city}`);
    }
    if (filters.district) {
      conditions.push(
        Prisma.sql`p.location->>'district' = ${filters.district}`,
      );
    }
    if (filters.minPrice != null) {
      conditions.push(Prisma.sql`p.price_egp >= ${filters.minPrice}`);
    }
    if (filters.maxPrice != null) {
      conditions.push(Prisma.sql`p.price_egp <= ${filters.maxPrice}`);
    }
    if (filters.propertyType) {
      conditions.push(
        Prisma.sql`p.property_type = ${filters.propertyType}::property_type`,
      );
    }
    if (filters.listingType) {
      conditions.push(
        Prisma.sql`p.listing_type = ${filters.listingType}::listing_type`,
      );
    }
    if (filters.provider) {
      conditions.push(
        Prisma.sql`p.provider = ${filters.provider}::listing_provider`,
      );
    }
    if (filters.minBedrooms != null) {
      conditions.push(Prisma.sql`p.bedrooms >= ${filters.minBedrooms}`);
    }
    if (filters.maxBedrooms != null) {
      conditions.push(Prisma.sql`p.bedrooms <= ${filters.maxBedrooms}`);
    }
    if (filters.minBathrooms != null) {
      conditions.push(Prisma.sql`p.bathrooms >= ${filters.minBathrooms}`);
    }
    if (filters.maxBathrooms != null) {
      conditions.push(Prisma.sql`p.bathrooms <= ${filters.maxBathrooms}`);
    }
    if (filters.minAreaSqm != null) {
      conditions.push(Prisma.sql`p.area_sqm >= ${filters.minAreaSqm}`);
    }
    if (filters.maxAreaSqm != null) {
      conditions.push(Prisma.sql`p.area_sqm <= ${filters.maxAreaSqm}`);
    }
  }

  private buildOrderBy(
    sort: string,
    fullText: boolean,
  ): Prisma.PropertyOrderByWithRelationInput | Prisma.PropertyOrderByWithRelationInput[] {
    switch (sort) {
      case 'price_asc':
        return { priceEgp: 'asc' };
      case 'price_desc':
        return { priceEgp: 'desc' };
      case 'relevance':
      case 'newest':
      default:
        return { syncedAt: 'desc' };
    }
  }

  private buildOrderSql(sort: string, query?: string): Prisma.Sql {
    if (sort === 'price_asc') {
      return Prisma.sql`p.price_egp ASC`;
    }
    if (sort === 'price_desc') {
      return Prisma.sql`p.price_egp DESC`;
    }
    if (sort === 'relevance' && query?.trim()) {
      return Prisma.sql`ts_rank(p.search_vector, plainto_tsquery('simple', ${query.trim()})) DESC, p.synced_at DESC`;
    }
    return Prisma.sql`p.synced_at DESC`;
  }
}
