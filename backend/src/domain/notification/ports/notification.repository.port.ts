export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export type NotificationChannel = 'push' | 'email';
export type NotificationJobStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'skipped';

export interface NotificationJobRecord {
  id: string;
  userId: string;
  bookingId: string | null;
  channel: NotificationChannel;
  eventType: string;
  payload: Record<string, unknown>;
  status: NotificationJobStatus;
  attempts: number;
  lastError: string | null;
  bullJobId: string | null;
  scheduledAt: Date;
  sentAt: Date | null;
  createdAt: Date;
}

export interface EnqueueNotificationInput {
  userId: string;
  bookingId: string;
  channel: NotificationChannel;
  eventType: string;
  payload: Record<string, unknown>;
}

export interface NotificationRepositoryPort {
  enqueue(input: EnqueueNotificationInput): Promise<NotificationJobRecord>;
  findRecentDuplicate(
    userId: string,
    eventType: string,
    bookingId: string,
    channel: NotificationChannel,
    withinMinutes: number,
  ): Promise<NotificationJobRecord | null>;
  markProcessing(id: string, bullJobId: string): Promise<void>;
  markSent(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
  markSkipped(id: string): Promise<void>;
  findById(id: string): Promise<NotificationJobRecord | null>;
  listActiveDeviceTokens(userId: string): Promise<string[]>;
  deactivateDeviceToken(token: string): Promise<void>;
}
