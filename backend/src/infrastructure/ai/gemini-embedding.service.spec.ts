import { ConfigService } from '@nestjs/config';
import { GeminiEmbeddingService } from './gemini-embedding.service';

describe('GeminiEmbeddingService', () => {
  const config = {
    get: jest.fn((key: string) => {
      if (key === 'gemini.mockEmbeddings') {
        return true;
      }
      if (key === 'gemini.embedMaxRetries') {
        return 3;
      }
      return undefined;
    }),
  };

  let service: GeminiEmbeddingService;

  beforeEach(() => {
    service = new GeminiEmbeddingService(
      config as unknown as ConfigService,
    );
  });

  it('returns 768-dim mock vectors', async () => {
    const vectors = await service.embedTexts(['apartment in Cairo']);
    expect(vectors).toHaveLength(1);
    expect(vectors[0]).toHaveLength(768);
    const norm = Math.sqrt(vectors[0].reduce((s, v) => s + v * v, 0));
    expect(norm).toBeCloseTo(1, 5);
  });

  it('retries are not needed in mock mode', async () => {
    const globalFetch = global.fetch;
    global.fetch = jest.fn();
    const [v] = await service.embedTexts(['test']);
    expect(v).toHaveLength(768);
    expect(global.fetch).not.toHaveBeenCalled();
    global.fetch = globalFetch;
  });
});
