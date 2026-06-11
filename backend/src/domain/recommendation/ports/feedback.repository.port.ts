import { FeedbackSentiment } from '../value-objects/feedback-sentiment.vo';

export const FEEDBACK_REPOSITORY = Symbol('FEEDBACK_REPOSITORY');

export interface FeedbackRecord {
  id: string;
  userId: string;
  propertyId: string;
  sentiment: FeedbackSentiment;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackRepositoryPort {
  upsert(
    userId: string,
    propertyId: string,
    sentiment: FeedbackSentiment,
  ): Promise<{ record: FeedbackRecord; created: boolean }>;
  listByUser(userId: string): Promise<FeedbackRecord[]>;
  listDislikedPropertyIds(userId: string): Promise<string[]>;
  listLikedPropertyIds(userId: string): Promise<string[]>;
}
