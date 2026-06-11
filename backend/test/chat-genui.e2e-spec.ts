process.env.AUTH_DEV_AUTO_VERIFY_EMAIL = 'true';
process.env.GEMINI_MOCK_EMBEDDINGS = 'true';
process.env.GEMINI_MOCK_CHAT = 'true';
process.env.GENUI_ENABLED = 'true';

import { randomUUID } from 'crypto';
import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe('AI Chat GenUI (e2e)', () => {
  let app: INestApplication<App>;
  let conversationId = '';
  const testEmail = `genui-${randomUUID()}@example.com`;
  const password = 'password1';
  let accessToken = '';

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

    const prisma = app.get(PrismaService);
    await prisma.aiAgent.upsert({
      where: { id: 'search-agent' },
      create: {
        id: 'search-agent',
        nameI18n: { en: 'Search Agent', ar: 'وكيل البحث' },
        description: { en: 'AI assistant', ar: 'مساعد' },
        isActive: true,
        isDefault: true,
        modelId: 'gemini-2.0-flash',
      },
      update: { isActive: true },
    });

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password,
        role: 'buyer',
        locale: 'en',
        consentAccepted: true,
        consentVersion: '2026-06-01',
      });

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password })
      .expect(200);

    accessToken = login.body.data.accessToken;

    const conv = await request(app.getHttpServer())
      .post('/api/v1/conversations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ agentId: 'search-agent' })
      .expect(201);

    conversationId = conv.body.data.id;
  });

  afterAll(async () => {
    if (!hasDatabase || !app) {
      return;
    }
    const prisma = app.get(PrismaService);
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await app.close();
  });

  it('POST message persists uiSurface when search runs', async () => {
    if (!hasDatabase || !conversationId) {
      return;
    }

    const res = await request(app.getHttpServer())
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'apartment in Maadi under 1 million' })
      .expect(200);

    const assistant = res.body.data.assistantMessage;
    expect(assistant.content).toBeTruthy();
    const hasSurface =
      assistant.uiSurface != null ||
      (assistant.listingRefs?.length ?? 0) > 0;
    expect(hasSurface).toBe(true);
  });
});
