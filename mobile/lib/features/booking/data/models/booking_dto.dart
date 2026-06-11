import 'package:json_annotation/json_annotation.dart';

part 'booking_dto.g.dart';

@JsonSerializable()
class BookingDto {
  const BookingDto({
    required this.id,
    required this.status,
    required this.propertyId,
    required this.agentId,
    required this.buyerId,
    required this.preferredAt,
    this.scheduledAt,
    this.buyerMessage,
    this.agentMessage,
    this.property,
  });

  factory BookingDto.fromJson(Map<String, dynamic> json) =>
      _$BookingDtoFromJson(json);

  Map<String, dynamic> toJson() => _$BookingDtoToJson(this);

  final String id;
  final String status;
  final String propertyId;
  final String agentId;
  final String buyerId;
  final String preferredAt;
  final String? scheduledAt;
  final String? buyerMessage;
  final String? agentMessage;
  final BookingPropertySummaryDto? property;
}

@JsonSerializable()
class BookingPropertySummaryDto {
  const BookingPropertySummaryDto({
    required this.id,
    required this.title,
    this.thumbnailUrl,
  });

  factory BookingPropertySummaryDto.fromJson(Map<String, dynamic> json) =>
      _$BookingPropertySummaryDtoFromJson(json);

  Map<String, dynamic> toJson() => _$BookingPropertySummaryDtoToJson(this);

  final String id;
  final String title;
  final String? thumbnailUrl;
}

@JsonSerializable()
class BookingListResponseDto {
  const BookingListResponseDto({required this.data});

  factory BookingListResponseDto.fromJson(Map<String, dynamic> json) =>
      _$BookingListResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$BookingListResponseDtoToJson(this);

  final List<BookingDto> data;
}

@JsonSerializable()
class BookingResponseDto {
  const BookingResponseDto({required this.data});

  factory BookingResponseDto.fromJson(Map<String, dynamic> json) =>
      _$BookingResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$BookingResponseDtoToJson(this);

  final BookingDto data;
}
