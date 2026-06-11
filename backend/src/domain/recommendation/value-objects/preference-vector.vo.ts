export const PREFERENCE_VECTOR_DIM = 768;

export class PreferenceVector {
  private constructor(
    public readonly values: readonly number[],
    public readonly signalCount: number,
    public readonly modelVersion: string,
  ) {}

  static create(
    values: number[],
    signalCount: number,
    modelVersion: string,
  ): PreferenceVector | null {
    if (values.length !== PREFERENCE_VECTOR_DIM) {
      return null;
    }
    if (!values.every((v) => Number.isFinite(v))) {
      return null;
    }
    if (signalCount < 0) {
      return null;
    }
    return new PreferenceVector(values, signalCount, modelVersion);
  }

  get isColdStart(): boolean {
    return this.signalCount === 0;
  }
}

export function meanUnitVector(vectors: number[][]): number[] | null {
  if (vectors.length === 0) {
    return null;
  }
  const dim = vectors[0].length;
  if (!vectors.every((v) => v.length === dim)) {
    return null;
  }

  const sum = new Array<number>(dim).fill(0);
  for (const vector of vectors) {
    for (let i = 0; i < dim; i++) {
      sum[i] += vector[i];
    }
  }
  const scale = 1 / vectors.length;
  for (let i = 0; i < dim; i++) {
    sum[i] *= scale;
  }

  let norm = 0;
  for (const v of sum) {
    norm += v * v;
  }
  norm = Math.sqrt(norm);
  if (norm === 0 || !Number.isFinite(norm)) {
    return null;
  }
  return sum.map((v) => v / norm);
}
