import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createHash } from 'crypto';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { EMBEDDING_MODEL_VERSION } from '../../domain/rag/ports/embedding.port';
import { EMBEDDING_PORT, EmbeddingPort } from '../../domain/rag/ports/embedding.port';
import {
  EMBEDDING_REPOSITORY,
  EmbeddingRepositoryPort,
} from '../../domain/rag/ports/embedding-repository.port';

interface FaqDoc {
  id: string;
  category: string;
  locale: string;
  title: string;
  body: string;
}

@Injectable()
export class FaqIngestService implements OnModuleInit {
  private readonly logger = new Logger(FaqIngestService.name);

  constructor(
    @Inject(EMBEDDING_REPOSITORY)
    private readonly embeddings: EmbeddingRepositoryPort,
    @Inject(EMBEDDING_PORT) private readonly embedder: EmbeddingPort,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.RAG_SKIP_FAQ_INGEST === 'true') {
      return;
    }
    try {
      const count = await this.ingestFromDisk();
      if (count > 0) {
        this.logger.log(`Ingested ${count} FAQ embedding chunk(s)`);
      }
    } catch (error) {
      this.logger.warn(
        `FAQ ingest skipped: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async ingestFromDisk(): Promise<number> {
    const dir = join(process.cwd(), 'data', 'knowledge', 'faq');
    if (!existsSync(dir)) {
      return 0;
    }

    const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
    let ingested = 0;

    for (const file of files) {
      const raw = readFileSync(join(dir, file), 'utf-8');
      const doc = parseFaqMarkdown(raw, file);
      if (!doc) {
        continue;
      }
      const embedded = await this.ingestFaq(doc);
      if (embedded) {
        ingested += 1;
      }
    }

    return ingested;
  }

  private async ingestFaq(doc: FaqDoc): Promise<boolean> {
    const entityId = faqIdToUuid(doc.id);
    const content = [
      '[FAQ]',
      `Category: ${doc.category}`,
      `Question: ${doc.title}`,
      `Answer: ${doc.body}`,
      `Locale: ${doc.locale}`,
      `faq_id: ${doc.id}`,
    ].join('\n');

    const contentHash = createHash('sha256').update(content).digest('hex');
    const existing = await this.embeddings.findContentHash('faq', entityId, 0);
    if (existing === contentHash) {
      return false;
    }

    const [vector] = await this.embedder.embedTexts([content]);
    await this.embeddings.upsert({
      entityType: 'faq',
      entityId,
      chunkIndex: 0,
      content,
      contentHash,
      vector,
      modelVersion: EMBEDDING_MODEL_VERSION,
    });
    return true;
  }
}

function parseFaqMarkdown(raw: string, filename: string): FaqDoc | null {
  const frontMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta: Record<string, string> = {};
  let body = raw;

  if (frontMatch) {
    for (const line of frontMatch[1].split('\n')) {
      const [key, ...rest] = line.split(':');
      if (key && rest.length) {
        meta[key.trim()] = rest.join(':').trim();
      }
    }
    body = frontMatch[2];
  }

  const titleMatch = body.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1]?.trim() ?? filename.replace('.md', '');
  const answer = body.replace(/^#\s+.+$/m, '').trim();

  const id = meta.id ?? filename.replace('.md', '');
  return {
    id,
    category: meta.category ?? 'general',
    locale: meta.locale ?? 'en',
    title,
    body: answer,
  };
}

function faqIdToUuid(faqId: string): string {
  const hash = createHash('sha256').update(`faq:${faqId}`).digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join('-');
}
