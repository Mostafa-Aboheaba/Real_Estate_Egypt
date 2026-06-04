// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'property_detail_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PropertyDetailDto _$PropertyDetailDtoFromJson(
  Map<String, dynamic> json,
) => PropertyDetailDto(
  id: json['id'] as String,
  title: json['title'] as String,
  description: json['description'] as String?,
  priceEgp: json['priceEgp'] as num,
  listingType: json['listingType'] as String,
  propertyType: json['propertyType'] as String,
  bedrooms: (json['bedrooms'] as num?)?.toInt(),
  bathrooms: (json['bathrooms'] as num?)?.toInt(),
  areaSqm: json['areaSqm'] as num?,
  location: PropertyLocationDto.fromJson(
    json['location'] as Map<String, dynamic>,
  ),
  amenities:
      (json['amenities'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
  images:
      (json['images'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
  provider: json['provider'] as String,
  providerLabel: json['providerLabel'] as String,
  sourceUrl: json['sourceUrl'] as String?,
  syncedAt: json['syncedAt'] as String,
  isActive: json['isActive'] as bool? ?? true,
);
