import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingAction,
  BookingStatus,
} from '../../domain/booking/enums/booking-status.enum';
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
import { BookingStateMachine } from '../../domain/booking/services/booking-state-machine';
import { NotificationEnqueueService } from '../notification/notification-enqueue.service';

export type BookingActor = 'buyer' | 'agent';

export interface UpdateBookingCommand {
  bookingId: string;
  actorUserId: string;
  actor: BookingActor;
  action: BookingAction;
  scheduledAt?: Date;
  proposedAt?: Date;
  message?: string;
}

@Injectable()
export class UpdateBookingUseCase {
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

  async execute(command: UpdateBookingCommand): Promise<BookingRecord> {
    const booking = await this.bookings.findById(command.bookingId);
    if (!booking) {
      throw new BookingDomainException(
        BookingErrorCode.BOOKING_NOT_FOUND,
        'Booking not found',
      );
    }

    this.assertAccess(booking, command.actorUserId, command.actor);

    if (
      !BookingStateMachine.canTransition(
        booking.status,
        command.action,
        command.actor,
      )
    ) {
      throw new BookingDomainException(
        BookingErrorCode.INVALID_TRANSITION,
        'Invalid booking transition',
      );
    }

    const now = new Date();

    switch (command.action) {
      case BookingAction.Confirm:
        return this.confirm(booking, command.scheduledAt ?? booking.preferredAt);
      case BookingAction.Decline:
        return this.decline(booking, command.message);
      case BookingAction.Cancel:
        return this.cancel(booking, command.message, now);
      case BookingAction.Complete:
        return this.complete(booking, now);
      case BookingAction.Propose:
        return this.propose(booking, command.proposedAt, command.message);
      default:
        throw new BookingDomainException(
          BookingErrorCode.VALIDATION_ERROR,
          'Unsupported action',
        );
    }
  }

  private assertAccess(
    booking: BookingRecord,
    userId: string,
    actor: BookingActor,
  ): void {
    const allowed =
      (actor === 'buyer' && booking.buyerId === userId) ||
      (actor === 'agent' && booking.agentId === userId);
    if (!allowed) {
      throw new BookingDomainException(
        BookingErrorCode.FORBIDDEN,
        'Not allowed to modify this booking',
      );
    }
  }

  private async confirm(
    booking: BookingRecord,
    scheduledAt: Date,
  ): Promise<BookingRecord> {
    const conflicts = await this.bookings.countConfirmedOverlappingSlot(
      booking.agentId,
      scheduledAt,
      booking.id,
    );
    if (conflicts > 0) {
      throw new BookingDomainException(
        BookingErrorCode.SLOT_UNAVAILABLE,
        'Agent slot unavailable',
      );
    }

    const updated = await this.bookings.update(booking.id, {
      status: BookingStatus.Confirmed,
      scheduledAt,
      confirmedAt: new Date(),
    });

    await this.notifications.enqueueBookingEvent({
      eventType: 'booking.confirmed',
      bookingId: updated.id,
      recipientUserId: updated.buyerId,
      propertyTitle: '',
      scheduledAt: updated.scheduledAt ?? scheduledAt,
      preferredAt: updated.preferredAt,
    });

    return updated;
  }

  private async decline(
    booking: BookingRecord,
    reason?: string,
  ): Promise<BookingRecord> {
    const updated = await this.bookings.update(booking.id, {
      status: BookingStatus.Declined,
      agentMessage: reason ?? null,
      cancelledAt: new Date(),
    });

    await this.notifications.enqueueBookingEvent({
      eventType: 'booking.declined',
      bookingId: updated.id,
      recipientUserId: updated.buyerId,
      propertyTitle: '',
      preferredAt: updated.preferredAt,
    });

    return updated;
  }

  private async cancel(
    booking: BookingRecord,
    reason: string | undefined,
    now: Date,
  ): Promise<BookingRecord> {
    if (!this.policy.canCancel(booking, now)) {
      throw new BookingDomainException(
        BookingErrorCode.CANCEL_WINDOW_CLOSED,
        'Cancel window has closed',
      );
    }

    const updated = await this.bookings.update(booking.id, {
      status: BookingStatus.Cancelled,
      agentMessage: reason ?? booking.agentMessage,
      cancelledAt: now,
    });

    const recipient =
      booking.buyerId === updated.buyerId
        ? updated.agentId
        : updated.buyerId;

    await this.notifications.enqueueBookingEvent({
      eventType: 'booking.cancelled',
      bookingId: updated.id,
      recipientUserId: recipient,
      propertyTitle: '',
      preferredAt: updated.preferredAt,
      scheduledAt: updated.scheduledAt ?? undefined,
    });

    return updated;
  }

  private async complete(
    booking: BookingRecord,
    now: Date,
  ): Promise<BookingRecord> {
    if (!this.policy.canComplete(booking, now)) {
      throw new BookingDomainException(
        BookingErrorCode.INVALID_TRANSITION,
        'Cannot complete booking yet',
      );
    }

    const updated = await this.bookings.update(booking.id, {
      status: BookingStatus.Completed,
    });

    await this.notifications.enqueueBookingEvent({
      eventType: 'booking.completed',
      bookingId: updated.id,
      recipientUserId: updated.buyerId,
      propertyTitle: '',
      scheduledAt: updated.scheduledAt ?? undefined,
    });

    return updated;
  }

  private async propose(
    booking: BookingRecord,
    proposedAt?: Date,
    message?: string,
  ): Promise<BookingRecord> {
    if (!proposedAt) {
      throw new BookingDomainException(
        BookingErrorCode.VALIDATION_ERROR,
        'proposedAt is required',
      );
    }

    const updated = await this.bookings.update(booking.id, {
      preferredAt: proposedAt,
      agentMessage: message ?? null,
    });

    await this.notifications.enqueueBookingEvent({
      eventType: 'booking.proposed',
      bookingId: updated.id,
      recipientUserId: updated.buyerId,
      propertyTitle: '',
      preferredAt: proposedAt,
    });

    return updated;
  }
}
