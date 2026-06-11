import { BookingStatus } from '../enums/booking-status.enum';

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');

export interface BookingRecord {
  id: string;
  buyerId: string;
  agentId: string;
  propertyId: string;
  status: BookingStatus;
  preferredAt: Date;
  scheduledAt: Date | null;
  buyerMessage: string | null;
  agentMessage: string | null;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyBookingContext {
  id: string;
  agentId: string | null;
  isActive: boolean;
  title: string;
  location: Record<string, unknown>;
  images: unknown[];
}

export interface BookingListItem extends BookingRecord {
  property?: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
  };
}

export interface PaginatedBookings {
  items: BookingListItem[];
  meta: { page: number; limit: number; total: number };
}

export interface CreateBookingInput {
  buyerId: string;
  agentId: string;
  propertyId: string;
  preferredAt: Date;
  buyerMessage?: string | null;
}

export interface UpdateBookingPatch {
  status?: BookingStatus;
  preferredAt?: Date;
  scheduledAt?: Date | null;
  buyerMessage?: string | null;
  agentMessage?: string | null;
  confirmedAt?: Date | null;
  cancelledAt?: Date | null;
}

export interface BookingRepositoryPort {
  create(input: CreateBookingInput): Promise<BookingRecord>;
  findById(id: string): Promise<BookingRecord | null>;
  update(id: string, patch: UpdateBookingPatch): Promise<BookingRecord>;
  findIdempotencyBookingId(key: string): Promise<string | null>;
  saveIdempotencyKey(key: string, bookingId: string): Promise<void>;
  getPropertyContext(propertyId: string): Promise<PropertyBookingContext | null>;
  listBuyerBookings(
    buyerId: string,
    status: BookingStatus | undefined,
    page: number,
    limit: number,
  ): Promise<PaginatedBookings>;
  listAgentBookings(
    agentId: string,
    status: BookingStatus | undefined,
    page: number,
    limit: number,
  ): Promise<PaginatedBookings>;
  countConfirmedOverlappingSlot(
    agentId: string,
    scheduledAt: Date,
    excludeBookingId?: string,
  ): Promise<number>;
  countAgentBookingsThisMonth(agentId: string, monthStart: Date): Promise<number>;
}
