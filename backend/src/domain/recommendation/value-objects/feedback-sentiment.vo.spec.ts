import {
  FeedbackSentiment,
  parseFeedbackSentiment,
} from './feedback-sentiment.vo';

describe('FeedbackSentiment', () => {
  it('accepts like and dislike', () => {
    expect(parseFeedbackSentiment('like')).toBe(FeedbackSentiment.Like);
    expect(parseFeedbackSentiment('dislike')).toBe(FeedbackSentiment.Dislike);
  });

  it('rejects invalid enum', () => {
    expect(parseFeedbackSentiment('love')).toBeNull();
    expect(parseFeedbackSentiment(null)).toBeNull();
  });
});
