import { Injectable } from '@nestjs/common';
import {
  NotificationChannel as PrismaChannel,
  NotificationJobStatus as PrismaJobStatus,
  Prisma,
} from '@prisma/client';
import {
  EnqueueNotificationInput,
  NotificationJobRecord,
  NotificationRepositoryPort,
} from '../../../domain/notification/ports/notification.repository.port';
import { PrismaService } from '../prisma/prisma.service';

function toRecord(row: {
  id: string;
  userId: string;
  bookingId: string | null;
  channel: PrismaChannel;
  eventType: string;
  payload: unknown;
  status: PrismaJobStatus;
  attempts: number;
  lastError: string | null;
  bullJobId: string | null;
  scheduledAt: Date;
  sentAt: Date | null;
  createdAt: Date;
}): NotificationJobRecord {
  return {
    id: row.id,
    userId: row.userId,
    bookingId: row.bookingId,
    channel: row.channel,
    eventType: row.eventType,
    payload: row.payload as Record<string, unknown>,
    status: row.status,
    attempts: row.attempts,
    lastError: row.lastError,
    bullJobId: row.bullJobId,
    scheduledAt: row.scheduledAt,
    sentAt: row.sentAt,
    createdAt: row.createdAt,
  };
}

@Injectable()
export class PrismaNotificationRepository implements NotificationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async enqueue(input: EnqueueNotificationInput): Promise<NotificationJobRecord> {
    const row = await this.prisma.notificationJob.create({
      data: {
        userId: input.userId,
        bookingId: input.bookingId,
        channel: input.channel as PrismaChannel,
        eventType: input.eventType,
        payload: input.payload as Prisma.InputJsonValue,
        scheduledAt: new Date(),
      },
    });
    return toRecord(row);
  }

  async findRecentDuplicate(
    userId: string,
    eventType: string,
    bookingId: string,
    channel: EnqueueNotificationInput['channel'],
    withinMinutes: number,
  ): Promise<NotificationJobRecord | null> {
    const since = new Date(Date.now() - withinMinutes * 60 * 1000);
    const row = await this.prisma.notificationJob.findFirst({
      where: {
        userId,
        eventType,
        bookingId,
        channel: channel as PrismaChannel,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
    });
    return row ? toRecord(row) : null;
  }

  async markProcessing(id: string, bullJobId: string): Promise<void> {
    await this.prisma.notificationJob.update({
      where: { id },
      data: {
        status: PrismaJobStatus.processing,
        bullJobId,
        attempts: { increment: 1 },
      },
    });
  }

  async markSent(id: string): Promise<void> {
    await this.prisma.notificationJob.update({
      where: { id },
      data: { status: PrismaJobStatus.sent, sentAt: new Date() },
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.prisma.notificationJob.update({
      where: { id },
      data: { status: PrismaJobStatus.failed, lastError: error },
    });
  }

  async markSkipped(id: string): Promise<void> {
    await this.prisma.notificationJob.update({
      where: { id },
      data: { status: PrismaJobStatus.skipped },
    });
  }

  async findById(id: string): Promise<NotificationJobRecord | null> {
    const row = await this.prisma.notificationJob.findUnique({ where: { id } });
    return row ? toRecord(row) : null;
  }

  async listActiveDeviceTokens(userId: string): Promise<string[]> {
    const rows = await this.prisma.deviceToken.findMany({
      where: { userId, isActive: true },
      select: { token: true },
    });
    return rows.map((r) => r.token);
  }

  async deactivateDeviceToken(token: string): Promise<void> {
    await this.prisma.deviceToken.updateMany({
      where: { token },
      data: { isActive: false },
    });
  }
}
