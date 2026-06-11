export enum RecommendationErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
  RECOMMENDATIONS_UNAVAILABLE = 'RECOMMENDATIONS_UNAVAILABLE',
  BLOCKED_FILTER_KEY = 'BLOCKED_FILTER_KEY',
}

export class RecommendationDomainException extends Error {
  constructor(
    public readonly code: RecommendationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'RecommendationDomainException';
  }
}
