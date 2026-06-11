import { Injectable } from '@nestjs/common';
import { SearchPreferences } from '../../../domain/profile/value-objects/search-preferences.vo';
import {
  SignalsPort,
  UserSignals,
} from '../../../domain/recommendation/ports/signals.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaSignalsAdapter implements SignalsPort {
  constructor(private readonly prisma: PrismaService) {}

  async loadUserSignals(userId: string): Promise<UserSignals> {
    const [feedback, favorites, user] = await Promise.all([
      this.prisma.listingFeedback.findMany({
        where: { userId },
        select: { propertyId: true, sentiment: true },
      }),
      this.prisma.favorite.findMany({
        where: { userId },
        select: { propertyId: true },
      }),
      this.prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: { searchPreferences: true },
      }),
    ]);

    const prefs = SearchPreferences.create(user?.searchPreferences ?? null);

    return {
      dislikedPropertyIds: feedback
        .filter((f) => f.sentiment === 'dislike')
        .map((f) => f.propertyId),
      favoritedPropertyIds: favorites.map((f) => f.propertyId),
      likedPropertyIds: feedback
        .filter((f) => f.sentiment === 'like')
        .map((f) => f.propertyId),
      searchPreferences: prefs?.toJSON() ?? null,
    };
  }
}
