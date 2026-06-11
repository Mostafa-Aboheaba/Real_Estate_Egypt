import 'package:injectable/injectable.dart';
import 'package:property_assistant/features/booking/data/datasources/remote/booking_api_service.dart';
import 'package:property_assistant/features/booking/data/mappers/booking_mapper.dart';
import 'package:property_assistant/features/booking/domain/entities/booking.dart';

@lazySingleton
class BookingRemoteDataSource {
  BookingRemoteDataSource(this._api);

  final BookingApiService _api;

  Future<Booking> createRequest({
    required String propertyId,
    required DateTime preferredAt,
    String? message,
    required String idempotencyKey,
  }) async {
    final dto = await _api.createBooking(
      {
        'propertyId': propertyId,
        'preferredAt': preferredAt.toUtc().toIso8601String(),
        if (message != null && message.isNotEmpty) 'message': message,
      },
      idempotencyKey,
    );
    return BookingMapper.toEntity(dto);
  }

  Future<List<Booking>> listAgentBookings({String? status}) async {
    final dto = await _api.listAgentBookings({
      if (status != null) 'status': status,
      'page': 1,
      'limit': 50,
    });
    return dto.data.map(BookingMapper.toEntity).toList();
  }

  Future<Booking> confirmBooking({
    required String bookingId,
    required DateTime scheduledAt,
  }) async {
    final dto = await _api.confirmBooking(bookingId, {
      'scheduledAt': scheduledAt.toUtc().toIso8601String(),
    });
    return BookingMapper.toEntity(dto);
  }

  Future<Booking> declineBooking({
    required String bookingId,
    String? reason,
  }) async {
    final dto = await _api.declineBooking(bookingId, {
      if (reason != null && reason.isNotEmpty) 'reason': reason,
    });
    return BookingMapper.toEntity(dto);
  }
}
