import 'package:dio/dio.dart';
import 'package:property_assistant/features/booking/data/models/booking_dto.dart';
import 'package:retrofit/retrofit.dart';

part 'booking_api_service.g.dart';

@RestApi()
abstract class BookingApiService {
  factory BookingApiService(Dio dio) = _BookingApiService;

  @POST('/bookings')
  Future<BookingDto> createBooking(
    @Body() Map<String, dynamic> body,
    @Header('Idempotency-Key') String idempotencyKey,
  );

  @GET('/agent/bookings')
  Future<BookingListResponseDto> listAgentBookings(
    @Queries() Map<String, dynamic> query,
  );

  @PATCH('/bookings/{id}/confirm')
  Future<BookingDto> confirmBooking(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );

  @PATCH('/bookings/{id}/decline')
  Future<BookingDto> declineBooking(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );
}
