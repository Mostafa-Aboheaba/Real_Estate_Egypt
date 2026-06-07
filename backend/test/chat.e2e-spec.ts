process.env.AUTH_DEV_AUTO_VERIFY_EMAIL = 'true';
process.env.GEMINI_MOCK_EMBEDDINGS = 'true';
process.env.GEMINI_MOCK_CHAT = 'true';

import { randomUUID } from 'crypto';
import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe('AI Chat (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const testEmail = `chat-${randomUUID()}@example.com`;
  const password = 'password1';
  let accessToken = '';
  let conversationId = '';

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
    prisma = app.get(PrismaService);

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

    const agents = [
      {
        id: 'search-agent',
        nameI18n: { en: 'Search Agent', ar: 'وكيل البحث' },
        isDefault: true,
      },
      {
        id: 'recommendation-agent',
        nameI18n: { en: 'Recommendation Agent', ar: 'وكيل التوصيات' },
        isDefault: false,
      },
      {
        id: 'booking-agent',
        nameI18n: { en: 'Booking Agent', ar: 'وكيل الحجز' },
        isDefault: false,
      },
      {
        id: 'followup-agent',
        nameI18n: { en: 'Follow-up Agent', ar: 'وكيل المتابعة' },
        isDefault: false,
      },
    ];
    for (const agent of agents) {
      await prisma.aiAgent.upsert({
        where: { id: agent.id },
        create: {
          id: agent.id,
          nameI18n: agent.nameI18n,
          description: { en: 'AI assistant', ar: 'مساعد' },
          isActive: true,
          isDefault: agent.isDefault,
          modelId: 'gemini-2.0-flash',
        },
        update: { isActive: true, isDefault: agent.isDefault },
      });
    }
  });

  afterAll(async () => {
    if (!hasDatabase || !app) {
      return;
    }
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await app.close();
  });

  it('GET /ai/agents returns seeded agents', async () => {
    if (!hasDatabase) {
      return;
    }
    const res = await request(app.getHttpServer())
      .get('/api/v1/ai/agents')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
  });

  it('POST /conversations creates session', async () => {
    if (!hasDatabase) {
      return;
    }
    const res = await request(app.getHttpServer())
      .post('/api/v1/conversations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ agentId: 'search-agent' })
      .expect(201);

    conversationId = res.body.data.id;
    expect(res.body.data.agentId).toBe('search-agent');
  });

  it('POST message returns assistant reply', async () => {
    if (!hasDatabase || !conversationId) {
      return;
    }
    const res = await request(app.getHttpServer())
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: '3 bedroom apartment in Maadi for rent' })
      .expect(200);

    expect(res.body.data.assistantMessage.content).toBeTruthy();
    expect(res.body.data.assistantMessage.agentId).toBe('search-agent');
  });

  it('fair housing block returns refusal without error status', async () => {
    if (!hasDatabase || !conversationId) {
      return;
    }
    const res = await request(app.getHttpServer())
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'villa for Christian families only' })
      .expect(200);

    expect(res.body.data.assistantMessage.content).toContain('discriminate');
  });

  it('guest cannot access conversations', async () => {
    if (!hasDatabase) {
      return;
    }
    await request(app.getHttpServer())
      .get('/api/v1/conversations')
      .expect(401);
  });
});
