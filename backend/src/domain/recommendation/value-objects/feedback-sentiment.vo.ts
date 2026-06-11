export enum FeedbackSentiment {
  Like = 'like',
  Dislike = 'dislike',
}

const VALID = new Set<string>(Object.values(FeedbackSentiment));

export function parseFeedbackSentiment(
  raw: unknown,
): FeedbackSentiment | null {
  if (typeof raw !== 'string' || !VALID.has(raw)) {
    return null;
  }
  return raw as FeedbackSentiment;
}
