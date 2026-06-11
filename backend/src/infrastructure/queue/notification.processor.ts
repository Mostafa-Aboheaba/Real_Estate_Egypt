import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepositoryPort,
} from '../../domain/notification/ports/notification.repository.port';
import { NotificationDispatchService } from '../notifications/notification-dispatch.service';
import {
  NOTIFICATIONS_QUEUE,
  SEND_NOTIFICATION_JOB,
} from './queue.constants';

export interface SendNotificationJobData {
  notificationJobId: string;
}

@Processor(NOTIFICATIONS_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepositoryPort,
    private readonly dispatch: NotificationDispatchService,
  ) {
    super();
  }

  async process(job: Job<SendNotificationJobData>): Promise<void> {
    if (job.name !== SEND_NOTIFICATION_JOB) {
      return;
    }

    const record = await this.notifications.findById(job.data.notificationJobId);
    if (!record) {
      this.logger.warn(`Notification job ${job.data.notificationJobId} missing`);
      return;
    }

    if (record.status === 'sent' || record.status === 'skipped') {
      return;
    }

    await this.notifications.markProcessing(record.id, job.id ?? record.id);

    try {
      await this.dispatch.dispatch(record);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'dispatch failed';
      await this.notifications.markFailed(record.id, message);
      throw error;
    }
  }
}
