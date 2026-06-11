import 'package:property_assistant/features/booking/data/models/booking_dto.dart';
import 'package:property_assistant/features/booking/domain/entities/booking.dart';

abstract final class BookingMapper {
  static Booking toEntity(BookingDto dto) {
    return Booking(
      id: dto.id,
      status: dto.status,
      propertyId: dto.propertyId,
      agentId: dto.agentId,
      buyerId: dto.buyerId,
      preferredAt: DateTime.parse(dto.preferredAt),
      scheduledAt:
          dto.scheduledAt != null ? DateTime.parse(dto.scheduledAt!) : null,
      buyerMessage: dto.buyerMessage,
      agentMessage: dto.agentMessage,
      propertyTitle: dto.property?.title,
      thumbnailUrl: dto.property?.thumbnailUrl,
    );
  }
}
