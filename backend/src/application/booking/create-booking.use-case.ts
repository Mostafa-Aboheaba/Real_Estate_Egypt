import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BookingStatus } from '../../domain/booking/enums/booking-status.enum';
import {
  BookingDomainException,
  BookingErrorCode,
} from '../../domain/booking/failures/booking.failures';
import {
  BOOKING_REPOSITORY,
  BookingRecord,
  BookingRepositoryPort,
} from '../../domain/booking/ports/booking.repository.port';
import { BookingPolicyService } from '../../domain/booking/services/booking-policy.service';
import { NotificationEnqueueService } from '../notification/notification-enqueue.service';

export interface CreateBookingCommand {
  buyerId: string;
  propertyId: string;
  preferredAt: Date;
  message?: string;
  idempotencyKey?: string;
}

@Injectable()
export class CreateBookingUseCase {
  private readonly policy: BookingPolicyService;

  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookings: BookingRepositoryPort,
    private readonly notifications: NotificationEnqueueService,
    config: ConfigService,
  ) {
    this.policy = new BookingPolicyService({
      slotWindowMinutes: config.get<number>('booking.slotWindowMinutes', 30),
      agentFreeQuotaPerMonth: config.get<number>(
        'booking.agentFreeQuotaPerMonth',
        5,
      ),
    });
  }

  async execute(command: CreateBookingCommand): Promise<BookingRecord> {
    if (command.idempotencyKey) {
      const existingId = await this.bookings.findIdempotencyBookingId(
        command.idempotencyKey,
      );
      if (existingId) {
        const existing = await this.bookings.findById(existingId);
        if (existing) {
          return existing;
        }
      }
    }

    const property = await this.bookings.getPropertyContext(command.propertyId);
    if (!property?.isActive || !property.agentId) {
      throw new BookingDomainException(
        BookingErrorCode.PROPERTY_NOT_FOUND,
        'Property not found or inactive',
      );
    }

    if (property.agentId === command.buyerId) {
      throw new BookingDomainException(
        BookingErrorCode.VALIDATION_ERROR,
        'Buyer cannot book their own listing',
      );
    }

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const monthlyCount = await this.bookings.countAgentBookingsThisMonth(
      property.agentId,
      monthStart,
    );
    if (this.policy.isQuotaExceeded(monthlyCount)) {
      throw new BookingDomainException(
        BookingErrorCode.AGENT_QUOTA_EXCEEDED,
        'Agent monthly booking quota exceeded',
      );
    }

    const booking = await this.bookings.create({
      buyerId: command.buyerId,
      agentId: property.agentId,
      propertyId: command.propertyId,
      preferredAt: command.preferredAt,
      buyerMessage: command.message ?? null,
    });

    if (command.idempotencyKey) {
      await this.bookings.saveIdempotencyKey(
        command.idempotencyKey,
        booking.id,
      );
    }

    await this.notifications.enqueueBookingEvent({
      eventType: 'booking.requested',
      bookingId: booking.id,
      recipientUserId: property.agentId,
      propertyTitle: property.title,
      preferredAt: booking.preferredAt,
    });

    return booking;
  }
}
