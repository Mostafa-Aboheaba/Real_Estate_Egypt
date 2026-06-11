import { BookingRecord } from '../../domain/booking/ports/booking.repository.port';

export function toBookingResponse(booking: BookingRecord) {
  return {
    id: booking.id,
    status: booking.status,
    propertyId: booking.propertyId,
    agentId: booking.agentId,
    buyerId: booking.buyerId,
    preferredAt: booking.preferredAt.toISOString(),
    scheduledAt: booking.scheduledAt?.toISOString() ?? null,
    buyerMessage: booking.buyerMessage,
    agentMessage: booking.agentMessage,
    confirmedAt: booking.confirmedAt?.toISOString() ?? null,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    timeline: buildTimeline(booking),
  };
}

function buildTimeline(booking: BookingRecord) {
  const events = [
    { status: 'requested', at: booking.createdAt.toISOString() },
  ];
  if (booking.confirmedAt) {
    events.push({
      status: 'confirmed',
      at: booking.confirmedAt.toISOString(),
    });
  }
  if (booking.cancelledAt) {
    events.push({
      status: booking.status,
      at: booking.cancelledAt.toISOString(),
    });
  }
  return events;
}
