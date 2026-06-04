process.env.AUTH_DEV_AUTO_VERIFY_EMAIL = 'true';
process.env.GEMINI_MOCK_EMBEDDINGS = 'true';

import { randomUUID } from 'crypto';
import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { EmbedListingService } from '../src/application/rag/embed-listing.service';

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe('RAG (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken = '';

  beforeAll(async () => {
    if (!hasDatabase) {
      return;
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: [
        { path: 'health', method: RequestMethod.ALL },
        { path: 'health/(.*)', method: RequestMethod.ALL },
        { path: 'metrics', method: RequestMethod.GET },
      ],
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const email = `rag-admin-${randomUUID()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'password1',
        role: 'admin',
        locale: 'en',
        consentAccepted: true,
        consentVersion: '2026-06-01',
      });

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'password1' })
      .expect(200);

    adminToken = login.body.data.accessToken;

    const embed = app.get(EmbedListingService);
    await embed.embedMissingBatch(50);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /ai/rag/retrieve returns listing IDs', async () => {
    if (!hasDatabase) {
      return;
    }

    const res = await request(app.getHttpServer())
      .post('/api/v1/ai/rag/retrieve')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ query: 'apartment Cairo rent', topK: 5 })
      .expect(201);

    expect(res.body.data.query).toBe('apartment Cairo rent');
    expect(Array.isArray(res.body.data.listingIds)).toBe(true);
    expect(Array.isArray(res.body.data.chunks)).toBe(true);
  });

  it('GET /metrics exposes RAG counters', async () => {
    if (!hasDatabase) {
      return;
    }

    await request(app.getHttpServer())
      .post('/api/v1/ai/rag/retrieve')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ query: 'villa New Cairo' })
      .expect(201);

    const metrics = await request(app.getHttpServer())
      .get('/metrics')
      .expect(200);

    expect(metrics.text).toContain('ai_rag_retrieve_total');
  });

  it('rejects buyer role with 403', async () => {
    if (!hasDatabase) {
      return;
    }

    const email = `rag-buyer-${randomUUID()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'password1',
        role: 'buyer',
        locale: 'en',
        consentAccepted: true,
        consentVersion: '2026-06-01',
      });

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'password1' })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/ai/rag/retrieve')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .send({ query: 'test' })
      .expect(403);
  });
});
