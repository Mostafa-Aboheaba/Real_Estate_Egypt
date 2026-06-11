import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepositoryPort,
} from '../../domain/notification/ports/notification.repository.port';
import {
  NOTIFICATIONS_QUEUE,
  SEND_NOTIFICATION_JOB,
} from '../../infrastructure/queue/queue.constants';

export interface BookingNotificationContext {
  eventType: string;
  bookingId: string;
  recipientUserId: string;
  propertyTitle: string;
  preferredAt?: Date;
  scheduledAt?: Date;
}

@Injectable()
export class NotificationEnqueueService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepositoryPort,
    @InjectQueue(NOTIFICATIONS_QUEUE) private readonly queue: Queue,
  ) {}

  async enqueueBookingEvent(ctx: BookingNotificationContext): Promise<void> {
    const basePayload = {
      bookingId: ctx.bookingId,
      propertyTitle: ctx.propertyTitle,
      preferredAt: ctx.preferredAt?.toISOString(),
      scheduledAt: ctx.scheduledAt?.toISOString(),
      deepLink: `aiproperty://bookings/${ctx.bookingId}`,
    };

    for (const channel of ['push', 'email'] as const) {
      const duplicate = await this.notifications.findRecentDuplicate(
        ctx.recipientUserId,
        ctx.eventType,
        ctx.bookingId,
        channel,
        5,
      );
      if (duplicate) {
        continue;
      }

      const job = await this.notifications.enqueue({
        userId: ctx.recipientUserId,
        bookingId: ctx.bookingId,
        channel,
        eventType: ctx.eventType,
        payload: { ...basePayload, event: ctx.eventType },
      });

      await this.queue.add(
        SEND_NOTIFICATION_JOB,
        { notificationJobId: job.id },
        {
          jobId: job.id,
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 },
        },
      );
    }
  }
}
