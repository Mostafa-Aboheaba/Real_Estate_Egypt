import { SearchPreferencesProps } from '../../profile/value-objects/search-preferences.vo';
import { RecommendationReasonStub } from '../entities/recommendation-candidate';

export const SCORING_PORT = Symbol('SCORING_PORT');

export interface ScoringFilters {
  searchPreferences?: SearchPreferencesProps | null;
}

export interface ScoredPropertyRow {
  propertyId: string;
  distance: number;
  title: string;
  priceEgp: number;
  listingType: string;
  propertyType: string;
  city: string;
  area: string;
  thumbnailUrl: string | null;
}

export interface ScoringQuery {
  vector?: number[];
  excludePropertyIds: string[];
  filters: ScoringFilters;
  page: number;
  pageSize: number;
  popularOnly?: boolean;
}

export interface ScoringPage {
  items: ScoredPropertyRow[];
  totalItems: number;
}

export interface ScoringPort {
  queryPersonalized(input: ScoringQuery): Promise<ScoringPage>;
  queryPopular(input: ScoringQuery): Promise<ScoringPage>;
}

export function distanceToScore(distance: number): number {
  const d = Math.max(0, distance);
  return Math.min(1, 1 / (1 + d));
}

export function inferReasonStub(
  hasLikes: boolean,
  hasPreferences: boolean,
  popularOnly: boolean,
): RecommendationReasonStub {
  if (popularOnly) {
    return 'popular';
  }
  if (hasLikes) {
    return 'similar_to_liked';
  }
  if (hasPreferences) {
    return 'matches_preferences';
  }
  return 'popular';
}
