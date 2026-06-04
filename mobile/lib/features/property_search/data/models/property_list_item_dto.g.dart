// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'property_list_item_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PropertyListItemDto _$PropertyListItemDtoFromJson(Map<String, dynamic> json) =>
    PropertyListItemDto(
      id: json['id'] as String,
      title: json['title'] as String,
      priceEgp: json['priceEgp'] as num,
      listingType: json['listingType'] as String,
      propertyType: json['propertyType'] as String,
      bedrooms: (json['bedrooms'] as num?)?.toInt(),
      bathrooms: (json['bathrooms'] as num?)?.toInt(),
      areaSqm: json['areaSqm'] as num?,
      location: PropertyLocationDto.fromJson(
        json['location'] as Map<String, dynamic>,
      ),
      thumbnailUrl: json['thumbnailUrl'] as String?,
      provider: json['provider'] as String,
      providerLabel: json['providerLabel'] as String,
      syncedAt: json['syncedAt'] as String,
    );
