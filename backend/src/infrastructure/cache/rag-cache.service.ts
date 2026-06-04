import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { createHash } from 'crypto';
import { RagRetrieveResult } from '../../domain/rag/types/rag.types';

const DEFAULT_TTL_SEC = 900;

@Injectable()
export class RagCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RagCacheService.name);
  private readonly redis: Redis | null;
  private readonly ttlSec: number;
  private memory = new Map<string, { value: RagRetrieveResult; expires: number }>();
  private cacheGeneration = 0;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('redis.host');
    const port = this.config.get<number>('redis.port');
    this.ttlSec = this.config.get<number>('rag.cacheTtlSec') ?? DEFAULT_TTL_SEC;

    try {
      this.redis = new Redis({ host, port, maxRetriesPerRequest: 1, lazyConnect: true });
      void this.redis.connect().catch(() => {
        this.logger.warn('Redis unavailable — RAG cache uses in-memory fallback');
      });
    } catch {
      this.redis = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis?.quit();
  }

  cacheKey(query: string, filters: Record<string, unknown>): string {
    const payload = JSON.stringify({ query, filters, gen: this.cacheGeneration });
    const hash = createHash('sha256').update(payload).digest('hex').slice(0, 32);
    return `rag:v1:${hash}`;
  }

  async get(key: string): Promise<RagRetrieveResult | null> {
    if (this.redis?.status === 'ready') {
      const raw = await this.redis.get(key);
      if (raw) {
        return JSON.parse(raw) as RagRetrieveResult;
      }
      return null;
    }

    const entry = this.memory.get(key);
    if (!entry || entry.expires < Date.now()) {
      this.memory.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: RagRetrieveResult): Promise<void> {
    const serialized = JSON.stringify({ ...value, cached: true });

    if (this.redis?.status === 'ready') {
      await this.redis.setex(key, this.ttlSec, serialized);
      return;
    }

    this.memory.set(key, {
      value: { ...value, cached: true },
      expires: Date.now() + this.ttlSec * 1000,
    });
  }

  /** Bump generation so prior query keys miss after listing embed updates. */
  async invalidateOnListingUpdate(): Promise<void> {
    this.cacheGeneration += 1;
    if (this.redis?.status === 'ready') {
      await this.redis.incr('rag:cache:generation');
    }
    this.memory.clear();
  }
}
