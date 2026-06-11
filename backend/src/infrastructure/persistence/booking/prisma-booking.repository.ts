import { Injectable } from '@nestjs/common';
import { BookingStatus as PrismaBookingStatus, Prisma } from '@prisma/client';
import { BookingStatus } from '../../../domain/booking/enums/booking-status.enum';
import {
  BookingListItem,
  BookingRecord,
  BookingRepositoryPort,
  CreateBookingInput,
  PaginatedBookings,
  PropertyBookingContext,
  UpdateBookingPatch,
} from '../../../domain/booking/ports/booking.repository.port';
import { PrismaService } from '../prisma/prisma.service';

function toDomainStatus(status: PrismaBookingStatus): BookingStatus {
  return status as BookingStatus;
}

function toRecord(row: {
  id: string;
  buyerId: string;
  agentId: string;
  propertyId: string;
  status: PrismaBookingStatus;
  preferredAt: Date;
  scheduledAt: Date | null;
  buyerMessage: string | null;
  agentMessage: string | null;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): BookingRecord {
  return {
    id: row.id,
    buyerId: row.buyerId,
    agentId: row.agentId,
    propertyId: row.propertyId,
    status: toDomainStatus(row.status),
    preferredAt: row.preferredAt,
    scheduledAt: row.scheduledAt,
    buyerMessage: row.buyerMessage,
    agentMessage: row.agentMessage,
    confirmedAt: row.confirmedAt,
    cancelledAt: row.cancelledAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function firstImageUrl(images: unknown): string | null {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }
  const first = images[0];
  if (typeof first === 'string') {
    return first;
  }
  if (first && typeof first === 'object' && 'url' in first) {
    return String((first as { url: unknown }).url);
  }
  return null;
}

@Injectable()
export class PrismaBookingRepository implements BookingRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateBookingInput): Promise<BookingRecord> {
    const row = await this.prisma.booking.create({
      data: {
        buyerId: input.buyerId,
        agentId: input.agentId,
        propertyId: input.propertyId,
        preferredAt: input.preferredAt,
        buyerMessage: input.buyerMessage ?? null,
      },
    });
    return toRecord(row);
  }

  async findById(id: string): Promise<BookingRecord | null> {
    const row = await this.prisma.booking.findUnique({ where: { id } });
    return row ? toRecord(row) : null;
  }

  async update(id: string, patch: UpdateBookingPatch): Promise<BookingRecord> {
    const row = await this.prisma.booking.update({
      where: { id },
      data: {
        status: patch.status as PrismaBookingStatus | undefined,
        preferredAt: patch.preferredAt,
        scheduledAt: patch.scheduledAt,
        buyerMessage: patch.buyerMessage,
        agentMessage: patch.agentMessage,
        confirmedAt: patch.confirmedAt,
        cancelledAt: patch.cancelledAt,
      },
    });
    return toRecord(row);
  }

  async findIdempotencyBookingId(key: string): Promise<string | null> {
    const row = await this.prisma.bookingIdempotencyKey.findUnique({
      where: { idempotencyKey: key },
    });
    return row?.bookingId ?? null;
  }

  async saveIdempotencyKey(key: string, bookingId: string): Promise<void> {
    await this.prisma.bookingIdempotencyKey.create({
      data: { idempotencyKey: key, bookingId },
    });
  }

  async getPropertyContext(
    propertyId: string,
  ): Promise<PropertyBookingContext | null> {
    const row = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        agentId: true,
        isActive: true,
        title: true,
        location: true,
        images: true,
      },
    });
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      agentId: row.agentId,
      isActive: row.isActive,
      title: row.title,
      location: row.location as Record<string, unknown>,
      images: row.images as unknown[],
    };
  }

  async listBuyerBookings(
    buyerId: string,
    status: BookingStatus | undefined,
    page: number,
    limit: number,
  ): Promise<PaginatedBookings> {
    return this.listBookings({ buyerId }, status, page, limit);
  }

  async listAgentBookings(
    agentId: string,
    status: BookingStatus | undefined,
    page: number,
    limit: number,
  ): Promise<PaginatedBookings> {
    return this.listBookings({ agentId }, status, page, limit);
  }

  private async listBookings(
    whereUser: { buyerId: string } | { agentId: string },
    status: BookingStatus | undefined,
    page: number,
    limit: number,
  ): Promise<PaginatedBookings> {
    const where: Prisma.BookingWhereInput = {
      ...whereUser,
      ...(status ? { status: status as PrismaBookingStatus } : {}),
    };
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          property: { select: { id: true, title: true, images: true } },
        },
        orderBy: [{ status: 'asc' }, { preferredAt: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    const items: BookingListItem[] = rows.map((row) => ({
      ...toRecord(row),
      property: row.property
        ? {
            id: row.property.id,
            title: row.property.title,
            thumbnailUrl: firstImageUrl(row.property.images),
          }
        : undefined,
    }));

    return { items, meta: { page, limit, total } };
  }

  async countConfirmedOverlappingSlot(
    agentId: string,
    scheduledAt: Date,
    excludeBookingId?: string,
  ): Promise<number> {
    const windowMs = 30 * 60 * 1000;
    const from = new Date(scheduledAt.getTime() - windowMs);
    const to = new Date(scheduledAt.getTime() + windowMs);
    return this.prisma.booking.count({
      where: {
        agentId,
        status: PrismaBookingStatus.confirmed,
        scheduledAt: { gte: from, lte: to },
        ...(excludeBookingId ? { NOT: { id: excludeBookingId } } : {}),
      },
    });
  }

  async countAgentBookingsThisMonth(
    agentId: string,
    monthStart: Date,
  ): Promise<number> {
    const monthEnd = new Date(monthStart);
    monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);
    return this.prisma.booking.count({
      where: {
        agentId,
        createdAt: { gte: monthStart, lt: monthEnd },
        status: {
          in: [
            PrismaBookingStatus.requested,
            PrismaBookingStatus.confirmed,
            PrismaBookingStatus.completed,
          ],
        },
      },
    });
  }
}
