import { Inject, Injectable } from '@nestjs/common';
import { BookingStatus } from '../../domain/booking/enums/booking-status.enum';
import {
  BookingDomainException,
  BookingErrorCode,
} from '../../domain/booking/failures/booking.failures';
import {
  BOOKING_REPOSITORY,
  BookingRecord,
  BookingRepositoryPort,
  PaginatedBookings,
} from '../../domain/booking/ports/booking.repository.port';

@Injectable()
export class BookingQueryService {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookings: BookingRepositoryPort,
  ) {}

  async getForParticipant(
    bookingId: string,
    userId: string,
  ): Promise<BookingRecord> {
    const booking = await this.bookings.findById(bookingId);
    if (!booking) {
      throw new BookingDomainException(
        BookingErrorCode.BOOKING_NOT_FOUND,
        'Booking not found',
      );
    }
    if (booking.buyerId !== userId && booking.agentId !== userId) {
      throw new BookingDomainException(
        BookingErrorCode.FORBIDDEN,
        'Not allowed to view this booking',
      );
    }
    return booking;
  }

  listBuyer(
    buyerId: string,
    status: string | undefined,
    page: number,
    limit: number,
  ): Promise<PaginatedBookings> {
    return this.bookings.listBuyerBookings(
      buyerId,
      status as BookingStatus | undefined,
      page,
      limit,
    );
  }

  listAgent(
    agentId: string,
    status: string | undefined,
    page: number,
    limit: number,
  ): Promise<PaginatedBookings> {
    return this.bookings.listAgentBookings(
      agentId,
      status as BookingStatus | undefined,
      page,
      limit,
    );
  }
}
