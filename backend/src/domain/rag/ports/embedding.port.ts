export const EMBEDDING_PORT = Symbol('EMBEDDING_PORT');

export const EMBEDDING_MODEL_VERSION = 'text-embedding-004';
export const EMBEDDING_DIMENSIONS = 768;

export interface EmbeddingPort {
  embedTexts(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}
