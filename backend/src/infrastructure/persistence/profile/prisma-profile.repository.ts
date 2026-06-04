import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  AgentPublicProfile,
  FavoriteRecord,
  FullUserProfile,
  PaginatedFavorites,
  ProfileRepositoryPort,
  UpdateProfilePatch,
} from '../../../domain/profile/ports/profile.repository.port';
import { PrismaService } from '../prisma/prisma.service';
import {
  toAgentPublicProfile,
  toFavoriteRecord,
  toFullProfile,
} from './profile.mapper';

const PROFILE_SELECT = {
  id: true,
  email: true,
  role: true,
  name: true,
  phone: true,
  locale: true,
  avatarUrl: true,
  preferredAgentId: true,
  searchPreferences: true,
  agentProfile: true,
  emailVerified: true,
  createdAt: true,
} as const;

@Injectable()
export class PrismaProfileRepository implements ProfileRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findFullProfile(userId: string): Promise<FullUserProfile | null> {
    const row = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: PROFILE_SELECT,
    });
    return row ? toFullProfile(row) : null;
  }

  async updateProfile(
    userId: string,
    patch: UpdateProfilePatch,
  ): Promise<FullUserProfile> {
    const data: Prisma.UserUpdateInput = {};
    if (patch.name !== undefined) {
      data.name = patch.name;
    }
    if (patch.phone !== undefined) {
      data.phone = patch.phone;
    }
    if (patch.locale !== undefined) {
      data.locale = patch.locale;
    }
    if (patch.avatarUrl !== undefined) {
      data.avatarUrl = patch.avatarUrl;
    }
    if (patch.preferredAgentId !== undefined) {
      data.preferredAgentId = patch.preferredAgentId;
    }
    if (patch.searchPreferences !== undefined) {
      data.searchPreferences =
        patch.searchPreferences as unknown as Prisma.InputJsonValue;
    }
    if (patch.agentProfile !== undefined) {
      data.agentProfile =
        patch.agentProfile as unknown as Prisma.InputJsonValue;
    }
    const row = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: PROFILE_SELECT,
    });
    return toFullProfile(row);
  }

  async softDeleteUser(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }

  async addFavorite(
    userId: string,
    propertyId: string,
  ): Promise<{ record: FavoriteRecord; created: boolean }> {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, isActive: true },
    });
    if (!property) {
      throw new Error('PROPERTY_MISSING');
    }

    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: { userId, propertyId },
      },
    });

    if (existing) {
      return {
        record: toFavoriteRecord(existing, property),
        created: false,
      };
    }

    const created = await this.prisma.favorite.create({
      data: { userId, propertyId },
    });
    return {
      record: toFavoriteRecord(created, property),
      created: true,
    };
  }

  async removeFavorite(userId: string, propertyId: string): Promise<boolean> {
    const result = await this.prisma.favorite.deleteMany({
      where: { userId, propertyId },
    });
    return result.count > 0;
  }

  async listFavorites(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedFavorites> {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { property: true },
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    return {
      items: rows.map((r) => toFavoriteRecord(r, r.property)),
      page,
      limit,
      total,
      hasMore: skip + rows.length < total,
    };
  }

  async findAgentPublicProfile(
    agentUserId: string,
    locale: string,
  ): Promise<AgentPublicProfile | null> {
    const row = await this.prisma.user.findFirst({
      where: { id: agentUserId, deletedAt: null, role: 'agent' },
      select: PROFILE_SELECT,
    });
    if (!row) {
      return null;
    }
    return toAgentPublicProfile(row, locale);
  }
}
