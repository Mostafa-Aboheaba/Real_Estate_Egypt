import 'package:injectable/injectable.dart';
import 'package:property_assistant/features/booking/data/datasources/remote/booking_remote_datasource.dart';
import 'package:property_assistant/features/booking/domain/entities/booking.dart';
import 'package:property_assistant/features/booking/domain/repositories/booking_repository.dart';

@LazySingleton(as: BookingRepository)
class BookingRepositoryImpl implements BookingRepository {
  BookingRepositoryImpl(this._remote);

  final BookingRemoteDataSource _remote;

  @override
  Future<Booking> createRequest({
    required String propertyId,
    required DateTime preferredAt,
    String? message,
    required String idempotencyKey,
  }) =>
      _remote.createRequest(
        propertyId: propertyId,
        preferredAt: preferredAt,
        message: message,
        idempotencyKey: idempotencyKey,
      );

  @override
  Future<List<Booking>> listAgentBookings({String? status}) =>
      _remote.listAgentBookings(status: status);

  @override
  Future<Booking> confirmBooking({
    required String bookingId,
    required DateTime scheduledAt,
  }) =>
      _remote.confirmBooking(
        bookingId: bookingId,
        scheduledAt: scheduledAt,
      );

  @override
  Future<Booking> declineBooking({
    required String bookingId,
    String? reason,
  }) =>
      _remote.declineBooking(bookingId: bookingId, reason: reason);
}
