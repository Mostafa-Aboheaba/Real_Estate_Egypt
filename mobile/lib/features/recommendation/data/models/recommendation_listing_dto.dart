import 'package:json_annotation/json_annotation.dart';

part 'recommendation_listing_dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class RecommendationListingDto {
  const RecommendationListingDto({
    required this.title,
    required this.priceEgp,
    required this.listingType,
    required this.propertyType,
    required this.location,
    this.thumbnailUrl,
  });

  final String title;
  final num priceEgp;
  final String listingType;
  final String propertyType;
  final RecommendationLocationDto location;
  final String? thumbnailUrl;

  factory RecommendationListingDto.fromJson(Map<String, dynamic> json) =>
      _$RecommendationListingDtoFromJson(json);
}

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class RecommendationLocationDto {
  const RecommendationLocationDto({
    required this.city,
    required this.area,
  });

  final String city;
  final String area;

  factory RecommendationLocationDto.fromJson(Map<String, dynamic> json) =>
      _$RecommendationLocationDtoFromJson(json);
}
