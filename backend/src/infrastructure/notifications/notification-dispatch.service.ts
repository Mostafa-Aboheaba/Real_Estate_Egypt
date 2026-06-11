import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NOTIFICATION_REPOSITORY,
  NotificationJobRecord,
  NotificationRepositoryPort,
} from '../../domain/notification/ports/notification.repository.port';
import { PrismaService } from '../persistence/prisma/prisma.service';
import { BookingEmailService } from './booking-email.service';
import { resolvePushCopy } from './booking-push-copy';
import { FcmService } from './fcm.service';

@Injectable()
export class NotificationDispatchService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepositoryPort,
    private readonly fcm: FcmService,
    private readonly email: BookingEmailService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async dispatch(job: NotificationJobRecord): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: job.userId },
      select: { email: true, locale: true, name: true },
    });
    if (!user) {
      await this.notifications.markFailed(job.id, 'Recipient not found');
      return;
    }

    if (job.channel === 'push') {
      await this.dispatchPush(job, user.locale);
      return;
    }

    await this.dispatchEmail(job, user.email, user.locale, user.name);
  }

  private async dispatchPush(
    job: NotificationJobRecord,
    locale: string,
  ): Promise<void> {
    const tokens = await this.notifications.listActiveDeviceTokens(job.userId);
    if (tokens.length === 0) {
      await this.notifications.markSkipped(job.id);
      return;
    }

    const copy = resolvePushCopy(job.eventType, locale);
    const data = {
      type: 'booking',
      event: job.eventType,
      bookingId: String(job.payload.bookingId ?? job.bookingId ?? ''),
      deepLink: String(job.payload.deepLink ?? ''),
    };

    let anySuccess = false;
    for (const token of tokens) {
      const result = await this.fcm.send({
        token,
        title: copy.title,
        body: copy.body,
        data,
      });
      if (result.invalidToken) {
        await this.notifications.deactivateDeviceToken(token);
        continue;
      }
      if (result.success) {
        anySuccess = true;
      }
    }

    if (anySuccess) {
      await this.notifications.markSent(job.id);
    } else {
      await this.notifications.markFailed(job.id, 'All push tokens failed');
    }
  }

  private async dispatchEmail(
    job: NotificationJobRecord,
    email: string,
    locale: string,
    name: string | null,
  ): Promise<void> {
    const publicUrl = this.config.get<string>(
      'app.publicUrl',
      'http://localhost:3000',
    );
    const bookingId = String(job.payload.bookingId ?? job.bookingId ?? '');
    await this.email.sendBookingEmail(email, job.eventType, {
      locale,
      bookingId,
      propertyTitle: String(job.payload.propertyTitle ?? 'Property'),
      scheduledAtFormatted: String(job.payload.scheduledAt ?? ''),
      buyerName: name ?? undefined,
      manageUrl: `${publicUrl}/bookings/${bookingId}`,
    });
    await this.notifications.markSent(job.id);
  }
}
