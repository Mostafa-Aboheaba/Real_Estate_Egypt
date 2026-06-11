import 'package:json_annotation/json_annotation.dart';
import 'package:property_assistant/features/recommendation/data/models/recommendation_listing_dto.dart';

part 'recommendation_item_dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class RecommendationItemDto {
  const RecommendationItemDto({
    required this.propertyId,
    required this.score,
    required this.reasonStub,
    required this.listing,
  });

  final String propertyId;
  final double score;
  final String reasonStub;
  final RecommendationListingDto listing;

  factory RecommendationItemDto.fromJson(Map<String, dynamic> json) =>
      _$RecommendationItemDtoFromJson(json);
}
