import { PreferenceVector } from '../value-objects/preference-vector.vo';

export const PREFERENCE_VECTOR_REPOSITORY = Symbol(
  'PREFERENCE_VECTOR_REPOSITORY',
);

export interface PreferenceVectorRecord {
  userId: string;
  vector: PreferenceVector;
  computedAt: Date;
}

export interface PreferenceVectorRepositoryPort {
  findByUserId(userId: string): Promise<PreferenceVectorRecord | null>;
  upsert(
    userId: string,
    vector: number[],
    signalCount: number,
    modelVersion: string,
  ): Promise<void>;
  listEmbeddingsForPropertyIds(
    propertyIds: string[],
  ): Promise<Array<{ propertyId: string; vector: number[] }>>;
}
