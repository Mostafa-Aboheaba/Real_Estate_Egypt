process.env.AUTH_DEV_AUTO_VERIFY_EMAIL = 'true';

import { randomUUID } from 'crypto';
import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe('Profile (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const testEmail = `profile-${randomUUID()}@example.com`;
  const password = 'password1';
  let accessToken = '';
  let propertyId = '';

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

    const listing = await prisma.property.findFirst({
      where: { isActive: true },
    });
    propertyId = listing?.id ?? '';
  });

  afterAll(async () => {
    if (!hasDatabase || !app) {
      return;
    }
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await app.close();
  });

  it('GET /users/me returns 401 without token', async () => {
    if (!hasDatabase) {
      return;
    }
    await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
  });

  it('PATCH /users/me updates profile', async () => {
    if (!hasDatabase) {
      return;
    }
    const res = await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test User', phone: '+201012345678' })
      .expect(200);

    expect(res.body.data.name).toBe('Test User');
    expect(res.body.data.phone).toBe('+201012345678');
  });

  it('PATCH /users/me/preferences updates search prefs', async () => {
    if (!hasDatabase) {
      return;
    }
    const res = await request(app.getHttpServer())
      .patch('/api/v1/users/me/preferences')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ listingType: 'rent', maxPriceEgp: 20000 })
      .expect(200);

    expect(res.body.data.searchPreferences.listingType).toBe('rent');
  });

  it('sets preferred AI agent', async () => {
    if (!hasDatabase) {
      return;
    }
    await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ preferredAgentId: 'search-agent' })
      .expect(200);
  });

  it('favorites CRUD when property exists', async () => {
    if (!hasDatabase || !propertyId) {
      return;
    }
    await request(app.getHttpServer())
      .post(`/api/v1/users/me/favorites/${propertyId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    const list = await request(app.getHttpServer())
      .get('/api/v1/users/me/favorites')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(list.body.data.items.length).toBeGreaterThanOrEqual(1);

    await request(app.getHttpServer())
      .post(`/api/v1/users/me/favorites/${propertyId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/users/me/favorites/${propertyId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  });

  it('POST /users/me/export returns 202', async () => {
    if (!hasDatabase) {
      return;
    }
    const res = await request(app.getHttpServer())
      .post('/api/v1/users/me/export')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(202);

    expect(res.body.data.status).toBe('queued');
  });
});
