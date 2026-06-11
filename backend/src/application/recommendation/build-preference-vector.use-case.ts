import { Inject, Injectable } from '@nestjs/common';
import {
  PREFERENCE_VECTOR_REPOSITORY,
  PreferenceVectorRepositoryPort,
} from '../../domain/recommendation/ports/preference-vector.repository.port';
import {
  FEEDBACK_REPOSITORY,
  FeedbackRepositoryPort,
} from '../../domain/recommendation/ports/feedback.repository.port';
import { meanUnitVector } from '../../domain/recommendation/value-objects/preference-vector.vo';

const MODEL_VERSION = 'text-embedding-004';

@Injectable()
export class BuildPreferenceVectorUseCase {
  constructor(
    @Inject(FEEDBACK_REPOSITORY)
    private readonly feedback: FeedbackRepositoryPort,
    @Inject(PREFERENCE_VECTOR_REPOSITORY)
    private readonly vectors: PreferenceVectorRepositoryPort,
  ) {}

  async execute(userId: string): Promise<void> {
    const likedIds = await this.feedback.listLikedPropertyIds(userId);
    if (likedIds.length === 0) {
      await this.vectors.upsert(
        userId,
        Array.from({ length: 768 }, () => 0),
        0,
        MODEL_VERSION,
      );
      return;
    }

    const embeddings = await this.vectors.listEmbeddingsForPropertyIds(
      likedIds,
    );
    if (embeddings.length === 0) {
      await this.vectors.upsert(
        userId,
        Array.from({ length: 768 }, () => 0),
        0,
        MODEL_VERSION,
      );
      return;
    }

    const mean = meanUnitVector(embeddings.map((e) => e.vector));
    if (!mean) {
      await this.vectors.upsert(
        userId,
        Array.from({ length: 768 }, () => 0),
        0,
        MODEL_VERSION,
      );
      return;
    }

    await this.vectors.upsert(
      userId,
      mean,
      embeddings.length,
      MODEL_VERSION,
    );
  }
}
