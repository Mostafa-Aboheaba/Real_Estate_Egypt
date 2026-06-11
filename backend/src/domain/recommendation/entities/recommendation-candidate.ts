export type RecommendationReasonStub =
  | 'similar_to_liked'
  | 'matches_preferences'
  | 'popular'
  | 'chat_interest';

export interface RecommendationListingSummary {
  title: string;
  priceEgp: number;
  listingType: string;
  propertyType: string;
  location: { city: string; area: string };
  thumbnailUrl: string | null;
}

export class RecommendationCandidate {
  constructor(
    public readonly propertyId: string,
    public readonly score: number,
    public readonly distance: number,
    public readonly reasonStub: RecommendationReasonStub,
    public readonly listing: RecommendationListingSummary,
  ) {}
}
