import {
  PREFERENCE_VECTOR_DIM,
  PreferenceVector,
  meanUnitVector,
} from './preference-vector.vo';

describe('PreferenceVector', () => {
  it('requires 768-dim finite vector', () => {
    const values = Array.from({ length: PREFERENCE_VECTOR_DIM }, () => 0.1);
    const vector = PreferenceVector.create(values, 2, 'text-embedding-004');
    expect(vector).not.toBeNull();
    expect(vector!.isColdStart).toBe(false);
  });

  it('rejects wrong dimension', () => {
    expect(PreferenceVector.create([1, 2], 1, 'v1')).toBeNull();
  });

  it('meanUnitVector returns unit length vector', () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    const mean = meanUnitVector([a, b]);
    expect(mean).not.toBeNull();
    const norm = Math.sqrt(mean!.reduce((s, v) => s + v * v, 0));
    expect(norm).toBeCloseTo(1, 5);
  });

  it('mean of two like embeddings matches manual average', () => {
    const v1 = [0.6, 0.8, 0];
    const v2 = [0.8, 0.6, 0];
    const mean = meanUnitVector([v1, v2])!;
    expect(mean[0]).toBeCloseTo(0.7071, 3);
    expect(mean[1]).toBeCloseTo(0.7071, 3);
  });
});
