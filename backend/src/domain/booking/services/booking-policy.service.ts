import { BookingStatus } from '../enums/booking-status.enum';

export const DEFAULT_SLOT_WINDOW_MINUTES = 30;
export const DEFAULT_AGENT_FREE_QUOTA = 5;

export interface BookingPolicyConfig {
  slotWindowMinutes: number;
  agentFreeQuotaPerMonth: number;
}

export interface BookingSlotCheck {
  agentId: string;
  scheduledAt: Date;
  excludeBookingId?: string;
}

export interface BookingRecordLike {
  status: BookingStatus;
  preferredAt: Date;
  scheduledAt: Date | null;
}

export class BookingPolicyService {
  constructor(private readonly config: BookingPolicyConfig) {}

  isQuotaExceeded(monthlyCount: number): boolean {
    return monthlyCount >= this.config.agentFreeQuotaPerMonth;
  }

  slotsOverlap(a: Date, b: Date): boolean {
    const windowMs = this.config.slotWindowMinutes * 60 * 1000;
    return Math.abs(a.getTime() - b.getTime()) < windowMs;
  }

  canCancel(booking: BookingRecordLike, now: Date): boolean {
    const cutoff =
      booking.status === BookingStatus.Confirmed
        ? booking.scheduledAt
        : booking.preferredAt;
    if (!cutoff) {
      return false;
    }
    return now < cutoff;
  }

  canComplete(booking: BookingRecordLike, now: Date): boolean {
    if (booking.status !== BookingStatus.Confirmed || !booking.scheduledAt) {
      return false;
    }
    return now >= booking.scheduledAt;
  }
}
