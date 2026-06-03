import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const testEmail = `e2e-${Date.now()}@example.com`;
  const password = 'password1';

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
  });

  afterAll(async () => {
    if (!hasDatabase || !app) {
      return;
    }
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await app.close();
  });

  it('registers with 201', async () => {
    if (!hasDatabase) {
      return;
    }
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password,
        role: 'buyer',
        locale: 'en',
        consentAccepted: true,
        consentVersion: '2026-06-01',
      })
      .expect(201);

    expect(res.body.data.email).toBe(testEmail);
    expect(res.body.data.emailVerified).toBe(false);
  });

  it('rejects duplicate registration with 409', async () => {
    if (!hasDatabase) {
      return;
    }
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password,
        role: 'buyer',
        locale: 'en',
        consentAccepted: true,
        consentVersion: '2026-06-01',
      })
      .expect(409);
  });

  it('rejects login before email verification with 403', async () => {
    if (!hasDatabase) {
      return;
    }
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password })
      .expect(403);

    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('allows login and GET /users/me after verification', async () => {
    if (!hasDatabase) {
      return;
    }
    await prisma.user.updateMany({
      where: { email: testEmail },
      data: { emailVerified: true },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password })
      .expect(200);

    const access = loginRes.body.data.accessToken as string;
    const meRes = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${access}`)
      .expect(200);

    expect(meRes.body.data.email).toBe(testEmail);
  });
});
