import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL_VERSION,
  EmbeddingPort,
} from '../../domain/rag/ports/embedding.port';
import {
  RagDomainException,
  RagErrorCode,
} from '../../domain/rag/failures/rag.failures';

const GEMINI_EMBED_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents';

@Injectable()
export class GeminiEmbeddingService implements EmbeddingPort {
  private readonly logger = new Logger(GeminiEmbeddingService.name);
  private readonly apiKey: string | undefined;
  private readonly mockMode: boolean;
  private readonly maxRetries: number;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('gemini.apiKey');
    this.mockMode = this.config.get<boolean>('gemini.mockEmbeddings') ?? true;
    this.maxRetries = this.config.get<number>('gemini.embedMaxRetries') ?? 3;
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }
    if (this.mockMode) {
      return texts.map((t) => this.mockVector(t));
    }
    return this.callGeminiBatch(texts);
  }

  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.embedTexts([text]);
    return vector;
  }

  private async callGeminiBatch(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      throw new RagDomainException(
        RagErrorCode.EMBEDDING_FAILED,
        'GEMINI_API_KEY not configured',
      );
    }

    const requests = texts.map((text) => ({
      model: `models/${EMBEDDING_MODEL_VERSION}`,
      content: { parts: [{ text: text.slice(0, 8000) }] },
    }));

    let lastError: Error | undefined;
    for (let attempt = 0; attempt < this.maxRetries; attempt += 1) {
      try {
        const response = await fetch(`${GEMINI_EMBED_URL}?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requests }),
        });

        if (!response.ok) {
          const body = await response.text();
          const transient = response.status >= 500 || response.status === 429;
          if (transient && attempt < this.maxRetries - 1) {
            await sleep(200 * 2 ** attempt);
            continue;
          }
          throw new Error(`Gemini embed HTTP ${response.status}: ${body}`);
        }

        const json = (await response.json()) as {
          embeddings?: Array<{ values?: number[] }>;
        };
        const vectors = (json.embeddings ?? []).map((e) => e.values ?? []);
        if (vectors.length !== texts.length) {
          throw new Error('Gemini embed response size mismatch');
        }
        for (const v of vectors) {
          this.assertVector(v);
        }
        return vectors;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.maxRetries - 1) {
          await sleep(200 * 2 ** attempt);
        }
      }
    }

    this.logger.error(`Embedding failed after retries: ${lastError?.message}`);
    throw new RagDomainException(
      RagErrorCode.EMBEDDING_FAILED,
      lastError?.message,
    );
  }

  private assertVector(values: number[]): void {
    if (values.length !== EMBEDDING_DIMENSIONS) {
      throw new RagDomainException(
        RagErrorCode.EMBEDDING_FAILED,
        `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${values.length}`,
      );
    }
    if (values.some((n) => Number.isNaN(n))) {
      throw new RagDomainException(
        RagErrorCode.EMBEDDING_FAILED,
        'Embedding contains NaN',
      );
    }
  }

  /** Deterministic unit vector for local dev without Gemini API. */
  private mockVector(text: string): number[] {
    const hash = createHash('sha256').update(text).digest();
    const raw: number[] = [];
    for (let i = 0; i < EMBEDDING_DIMENSIONS; i += 1) {
      raw.push((hash[i % hash.length] / 127.5) - 1);
    }
    const norm = Math.sqrt(raw.reduce((s, v) => s + v * v, 0)) || 1;
    return raw.map((v) => v / norm);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
