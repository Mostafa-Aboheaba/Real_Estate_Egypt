// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BookingDto _$BookingDtoFromJson(Map<String, dynamic> json) => BookingDto(
  id: json['id'] as String,
  status: json['status'] as String,
  propertyId: json['property_id'] as String,
  agentId: json['agent_id'] as String,
  buyerId: json['buyer_id'] as String,
  preferredAt: json['preferred_at'] as String,
  scheduledAt: json['scheduled_at'] as String?,
  buyerMessage: json['buyer_message'] as String?,
  agentMessage: json['agent_message'] as String?,
  property: json['property'] == null
      ? null
      : BookingPropertySummaryDto.fromJson(
          json['property'] as Map<String, dynamic>,
        ),
);

Map<String, dynamic> _$BookingDtoToJson(BookingDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'status': instance.status,
      'property_id': instance.propertyId,
      'agent_id': instance.agentId,
      'buyer_id': instance.buyerId,
      'preferred_at': instance.preferredAt,
      'scheduled_at': instance.scheduledAt,
      'buyer_message': instance.buyerMessage,
      'agent_message': instance.agentMessage,
      'property': instance.property?.toJson(),
    };

BookingPropertySummaryDto _$BookingPropertySummaryDtoFromJson(
  Map<String, dynamic> json,
) => BookingPropertySummaryDto(
  id: json['id'] as String,
  title: json['title'] as String,
  thumbnailUrl: json['thumbnail_url'] as String?,
);

Map<String, dynamic> _$BookingPropertySummaryDtoToJson(
  BookingPropertySummaryDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'title': instance.title,
  'thumbnail_url': instance.thumbnailUrl,
};

BookingListResponseDto _$BookingListResponseDtoFromJson(
  Map<String, dynamic> json,
) => BookingListResponseDto(
  data: (json['data'] as List<dynamic>)
      .map((e) => BookingDto.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$BookingListResponseDtoToJson(
  BookingListResponseDto instance,
) => <String, dynamic>{'data': instance.data.map((e) => e.toJson()).toList()};

BookingResponseDto _$BookingResponseDtoFromJson(Map<String, dynamic> json) =>
    BookingResponseDto(
      data: BookingDto.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$BookingResponseDtoToJson(BookingResponseDto instance) =>
    <String, dynamic>{'data': instance.data.toJson()};
