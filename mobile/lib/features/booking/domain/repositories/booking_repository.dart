import 'package:property_assistant/features/booking/domain/entities/booking.dart';

abstract class BookingRepository {
  Future<Booking> createRequest({
    required String propertyId,
    required DateTime preferredAt,
    String? message,
    required String idempotencyKey,
  });

  Future<List<Booking>> listAgentBookings({String? status});

  Future<Booking> confirmBooking({
    required String bookingId,
    required DateTime scheduledAt,
  });

  Future<Booking> declineBooking({
    required String bookingId,
    String? reason,
  });
}
