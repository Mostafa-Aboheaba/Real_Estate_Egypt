// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recommendation_item_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RecommendationItemDto _$RecommendationItemDtoFromJson(
  Map<String, dynamic> json,
) => RecommendationItemDto(
  propertyId: json['propertyId'] as String,
  score: (json['score'] as num).toDouble(),
  reasonStub: json['reasonStub'] as String,
  listing: RecommendationListingDto.fromJson(
    json['listing'] as Map<String, dynamic>,
  ),
);
