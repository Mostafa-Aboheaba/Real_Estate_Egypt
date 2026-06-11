process.env.AUTH_DEV_AUTO_VERIFY_EMAIL = 'true';

import { randomUUID } from 'crypto';
import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe('Recommendations (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const testEmail = `rec-${randomUUID()}@example.com`;
  const password = 'password1';
  let accessToken = '';
  let propertyId = '';
  let secondPropertyId = '';

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

    const listings = await prisma.property.findMany({
      where: { isActive: true },
      take: 2,
      orderBy: { syncedAt: 'desc' },
    });
    propertyId = listings[0]?.id ?? '';
    secondPropertyId = listings[1]?.id ?? '';
  });

  afterAll(async () => {
    if (!hasDatabase || !app) {
      return;
    }
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await app.close();
  });

  it('GET /recommendations returns popular feed for guest', async () => {
    if (!hasDatabase) {
      return;
    }
    const res = await request(app.getHttpServer())
      .get('/api/v1/recommendations')
      .expect(200);

    expect(res.body.data.mode).toBe('popular');
    expect(res.body.data.title).toBe('popular_in_cairo');
    expect(res.body.data.cta).toBeDefined();
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('GET /recommendations returns feed for authenticated user', async () => {
    if (!hasDatabase) {
      return;
    }
    const res = await request(app.getHttpServer())
      .get('/api/v1/recommendations')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(['popular', 'personalized']).toContain(res.body.data.mode);
    expect(res.body.data.pagination.pageSize).toBe(10);
  });

  it('POST /recommendations/feedback is idempotent', async () => {
    if (!hasDatabase || !propertyId) {
      return;
    }
    await request(app.getHttpServer())
      .post('/api/v1/recommendations/feedback')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ propertyId, sentiment: 'like' })
      .expect(201);

    const again = await request(app.getHttpServer())
      .post('/api/v1/recommendations/feedback')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ propertyId, sentiment: 'like' })
      .expect(201);

    expect(again.body.data.sentiment).toBe('like');
  });

  it('disliked listing excluded from feed', async () => {
    if (!hasDatabase || !secondPropertyId) {
      return;
    }
    await request(app.getHttpServer())
      .post('/api/v1/recommendations/feedback')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ propertyId: secondPropertyId, sentiment: 'dislike' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/api/v1/recommendations?refresh=true')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const ids = res.body.data.items.map(
      (i: { propertyId: string }) => i.propertyId,
    );
    expect(ids).not.toContain(secondPropertyId);
  });

  it('page 2 has no duplicate IDs from page 1', async () => {
    if (!hasDatabase) {
      return;
    }
    const page1 = await request(app.getHttpServer())
      .get('/api/v1/recommendations?page=1&pageSize=5')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const page2 = await request(app.getHttpServer())
      .get('/api/v1/recommendations?page=2&pageSize=5')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const ids1 = page1.body.data.items.map(
      (i: { propertyId: string }) => i.propertyId,
    );
    const ids2 = page2.body.data.items.map(
      (i: { propertyId: string }) => i.propertyId,
    );
    const overlap = ids1.filter((id: string) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });
});
