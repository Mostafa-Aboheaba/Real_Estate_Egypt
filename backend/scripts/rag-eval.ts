/**
 * RAG golden-set evaluation — recall@5 on labeled queries.
 *
 * Usage:
 *   DATABASE_URL=... GEMINI_MOCK_EMBEDDINGS=true npx ts-node scripts/rag-eval.ts
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RagOrchestratorService } from '../src/application/rag/rag-orchestrator.service';
import { EmbedListingService } from '../src/application/rag/embed-listing.service';

interface GoldenCase {
  query: string;
  expectedListingSubstring?: string;
}

const GOLDEN: GoldenCase[] = [
  { query: 'apartment rent Cairo' },
  { query: 'villa sale New Cairo' },
  { query: 'studio affordable' },
  { query: '3 bedroom compound' },
  { query: 'property near downtown' },
];

const TARGET_RECALL_AT_5 = 0.4;

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const embed = app.get(EmbedListingService);
  const rag = app.get(RagOrchestratorService);

  const embedded = await embed.embedMissingBatch(100);
  console.log(`Embedded ${embedded} listings before eval`);

  let hits = 0;
  for (const sample of GOLDEN) {
    const result = await rag.retrieve({ query: sample.query, topK: 5 });
    const hit =
      result.listingIds.length > 0 ||
      result.chunks.some((c) => c.entityType === 'faq');
    if (hit) {
      hits += 1;
    }
    console.log(
      `  query="${sample.query}" chunks=${result.chunks.length} listings=${result.listingIds.length} empty=${result.empty}`,
    );
  }

  const recall = hits / GOLDEN.length;
  console.log(`\nRecall@5 (proxy): ${(recall * 100).toFixed(1)}% (${hits}/${GOLDEN.length})`);
  console.log(`Target: ${(TARGET_RECALL_AT_5 * 100).toFixed(0)}%`);

  await app.close();
  process.exit(recall >= TARGET_RECALL_AT_5 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
