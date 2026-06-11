import { Inject, Injectable } from '@nestjs/common';
import { RecommendationCandidate } from '../../domain/recommendation/entities/recommendation-candidate';
import {
  PREFERENCE_VECTOR_REPOSITORY,
  PreferenceVectorRepositoryPort,
} from '../../domain/recommendation/ports/preference-vector.repository.port';
import {
  SCORING_PORT,
  ScoringPort,
  distanceToScore,
  inferReasonStub,
} from '../../domain/recommendation/ports/scoring.port';
import {
  SIGNALS_PORT,
  SignalsPort,
} from '../../domain/recommendation/ports/signals.port';

export type RecommendationMode = 'personalized' | 'popular';

export interface RecommendationFeedPage {
  title: string;
  mode: RecommendationMode;
  items: RecommendationCandidate[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
  };
  cta?: {
    messageKey: string;
    action: string;
  };
}

@Injectable()
export class GetRecommendationsUseCase {
  constructor(
    @Inject(SIGNALS_PORT) private readonly signals: SignalsPort,
    @Inject(PREFERENCE_VECTOR_REPOSITORY)
    private readonly vectors: PreferenceVectorRepositoryPort,
    @Inject(SCORING_PORT) private readonly scoring: ScoringPort,
  ) {}

  async executeForGuest(
    page: number,
    pageSize: number,
  ): Promise<RecommendationFeedPage> {
    const result = await this.scoring.queryPopular({
      excludePropertyIds: [],
      filters: {},
      page,
      pageSize,
      popularOnly: true,
    });
    return this.toFeedPage(result, 'popular', page, pageSize, {
      messageKey: 'register_for_personalized',
      action: 'navigate_register',
    });
  }

  async executeForUser(
    userId: string,
    page: number,
    pageSize: number,
    refresh = false,
  ): Promise<RecommendationFeedPage> {
    void refresh;
    const userSignals = await this.signals.loadUserSignals(userId);
    const excludeIds = [
      ...new Set([
        ...userSignals.dislikedPropertyIds,
        ...userSignals.favoritedPropertyIds,
      ]),
    ];

    const vectorRecord = await this.vectors.findByUserId(userId);
    const hasVector =
      vectorRecord != null && !vectorRecord.vector.isColdStart;

    const hasPreferences = Boolean(
      userSignals.searchPreferences &&
        Object.keys(userSignals.searchPreferences).length > 0,
    );
    const hasLikes = userSignals.likedPropertyIds.length > 0;

    if (!hasVector) {
      const result = await this.scoring.queryPopular({
        excludePropertyIds: excludeIds,
        filters: { searchPreferences: userSignals.searchPreferences },
        page,
        pageSize,
        popularOnly: true,
      });
      return this.toFeedPage(result, 'popular', page, pageSize);
    }

    const result = await this.scoring.queryPersonalized({
      vector: [...vectorRecord!.vector.values],
      excludePropertyIds: excludeIds,
      filters: { searchPreferences: userSignals.searchPreferences },
      page,
      pageSize,
    });

    const reasonStub = inferReasonStub(
      hasLikes,
      hasPreferences,
      false,
    );

    return this.toFeedPage(
      result,
      'personalized',
      page,
      pageSize,
      undefined,
      reasonStub,
    );
  }

  private toFeedPage(
    result: {
      items: Array<{
        propertyId: string;
        distance: number;
        title: string;
        priceEgp: number;
        listingType: string;
        propertyType: string;
        city: string;
        area: string;
        thumbnailUrl: string | null;
      }>;
      totalItems: number;
    },
    mode: RecommendationMode,
    page: number,
    pageSize: number,
    cta?: { messageKey: string; action: string },
    reasonStubOverride?: RecommendationCandidate['reasonStub'],
  ): RecommendationFeedPage {
    const totalPages = Math.max(1, Math.ceil(result.totalItems / pageSize));
    const title =
      mode === 'popular' ? 'popular_in_cairo' : 'properties_you_might_like';

    const items = result.items.map(
      (row) =>
        new RecommendationCandidate(
          row.propertyId,
          distanceToScore(row.distance),
          row.distance,
          reasonStubOverride ?? (mode === 'popular' ? 'popular' : 'matches_preferences'),
          {
            title: row.title,
            priceEgp: row.priceEgp,
            listingType: row.listingType,
            propertyType: row.propertyType,
            location: { city: row.city, area: row.area },
            thumbnailUrl: row.thumbnailUrl,
          },
        ),
    );

    return {
      title,
      mode,
      items,
      pagination: {
        page,
        pageSize,
        totalItems: result.totalItems,
        totalPages,
        hasNext: page < totalPages,
      },
      cta,
    };
  }
}
