process.env.AUTH_DEV_AUTO_VERIFY_EMAIL = 'true';

import { randomUUID } from 'crypto';
import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { NotificationDispatchService } from '../src/infrastructure/notifications/notification-dispatch.service';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';
import {
  ListingProvider,
  ListingType,
  PropertyType,
} from '@prisma/client';

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe('Booking (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let dispatch: NotificationDispatchService;

  const buyerEmail = `buyer-${randomUUID()}@example.com`;
  const agentEmail = `agent-${randomUUID()}@example.com`;
  const password = 'password1';

  let buyerToken = '';
  let agentToken = '';
  let propertyId = '';
  let bookingId = '';

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
    dispatch = app.get(NotificationDispatchService);

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: buyerEmail,
        password,
        role: 'buyer',
        locale: 'en',
        consentAccepted: true,
        consentVersion: '2026-06-01',
      });

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: agentEmail,
        password,
        role: 'agent',
        locale: 'en',
        consentAccepted: true,
        consentVersion: '2026-06-01',
      });

    const buyerLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: buyerEmail, password })
      .expect(200);
    buyerToken = buyerLogin.body.data.accessToken;

    const agentLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: agentEmail, password })
      .expect(200);
    agentToken = agentLogin.body.data.accessToken;

    const agentUser = await prisma.user.findUniqueOrThrow({
      where: { email: agentEmail },
    });
    const buyerUser = await prisma.user.findUniqueOrThrow({
      where: { email: buyerEmail },
    });

    const property = await prisma.property.create({
      data: {
        externalId: `e2e-${randomUUID()}`,
        provider: ListingProvider.shaety,
        listingType: ListingType.sale,
        propertyType: PropertyType.apartment,
        title: 'E2E Booking Apartment',
        priceEgp: 1500000,
        location: { city: 'Cairo', district: 'Maadi' },
        isActive: true,
        agentId: agentUser.id,
      },
    });
    propertyId = property.id;

    await prisma.deviceToken.createMany({
      data: [
        {
          userId: agentUser.id,
          token: `test-fcm-agent-${randomUUID()}`,
          platform: 'android',
        },
        {
          userId: buyerUser.id,
          token: `test-fcm-buyer-${randomUUID()}`,
          platform: 'android',
        },
      ],
    });
  }, 60000);

  afterAll(async () => {
    if (!hasDatabase || !app) {
      return;
    }
    await prisma.notificationJob.deleteMany({
      where: { booking: { propertyId } },
    });
    await prisma.booking.deleteMany({ where: { propertyId } });
    await prisma.property.deleteMany({ where: { id: propertyId } });
    await prisma.user.deleteMany({
      where: { email: { in: [buyerEmail, agentEmail] } },
    });
    await app.close();
  });

  it('buyer creates booking request', async () => {
    if (!hasDatabase) {
      return;
    }

    const preferredAt = new Date();
    preferredAt.setUTCDate(preferredAt.getUTCDate() + 3);
    preferredAt.setUTCHours(14, 0, 0, 0);

    const res = await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${buyerToken}`)
      .set('Idempotency-Key', randomUUID())
      .send({
        propertyId,
        preferredAt: preferredAt.toISOString(),
        message: 'Available after 2pm',
      })
      .expect(201);

    expect(res.body.data.status).toBe('requested');
    bookingId = res.body.data.id;
  });

  it('agent confirms booking and notification job completes', async () => {
    if (!hasDatabase || !bookingId) {
      return;
    }

    const preferredAt = new Date();
    preferredAt.setUTCDate(preferredAt.getUTCDate() + 3);
    preferredAt.setUTCHours(14, 0, 0, 0);

    const confirm = await request(app.getHttpServer())
      .patch(`/api/v1/bookings/${bookingId}/confirm`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ scheduledAt: preferredAt.toISOString() })
      .expect(200);

    expect(confirm.body.data.status).toBe('confirmed');

    const job = await prisma.notificationJob.findFirst({
      where: { bookingId, eventType: 'booking.confirmed', channel: 'push' },
      orderBy: { createdAt: 'desc' },
    });
    expect(job).toBeTruthy();

    if (job) {
      await dispatch.dispatch({
        id: job.id,
        userId: job.userId,
        bookingId: job.bookingId,
        channel: 'push',
        eventType: job.eventType,
        payload: job.payload as Record<string, unknown>,
        status: job.status,
        attempts: job.attempts,
        lastError: job.lastError,
        bullJobId: job.bullJobId,
        scheduledAt: job.scheduledAt,
        sentAt: job.sentAt,
        createdAt: job.createdAt,
      });

      const updated = await prisma.notificationJob.findUniqueOrThrow({
        where: { id: job.id },
      });
      expect(updated.status).toBe('sent');
      expect((job.payload as { bookingId?: string }).bookingId ?? bookingId).toBe(
        bookingId,
      );
    }
  });

  it('returns 404 for inactive property', async () => {
    if (!hasDatabase) {
      return;
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: { isActive: false },
    });

    const preferredAt = new Date();
    preferredAt.setUTCDate(preferredAt.getUTCDate() + 4);

    await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${buyerToken}`)
      .set('Idempotency-Key', randomUUID())
      .send({
        propertyId,
        preferredAt: preferredAt.toISOString(),
      })
      .expect(404);

    await prisma.property.update({
      where: { id: propertyId },
      data: { isActive: true },
    });
  });
});
