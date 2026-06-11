// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recommendation_listing_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RecommendationListingDto _$RecommendationListingDtoFromJson(
  Map<String, dynamic> json,
) => RecommendationListingDto(
  title: json['title'] as String,
  priceEgp: json['priceEgp'] as num,
  listingType: json['listingType'] as String,
  propertyType: json['propertyType'] as String,
  location: RecommendationLocationDto.fromJson(
    json['location'] as Map<String, dynamic>,
  ),
  thumbnailUrl: json['thumbnailUrl'] as String?,
);

RecommendationLocationDto _$RecommendationLocationDtoFromJson(
  Map<String, dynamic> json,
) => RecommendationLocationDto(
  city: json['city'] as String,
  area: json['area'] as String,
);
