import 'package:json_annotation/json_annotation.dart';
import 'package:property_assistant/features/recommendation/data/models/recommendation_item_dto.dart';

part 'recommendation_feed_dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class RecommendationFeedDto {
  const RecommendationFeedDto({
    required this.title,
    required this.mode,
    required this.items,
    required this.pagination,
    this.cta,
  });

  final String title;
  final String mode;
  final List<RecommendationItemDto> items;
  final RecommendationPaginationDto pagination;
  final RecommendationCtaDto? cta;

  factory RecommendationFeedDto.fromJson(Map<String, dynamic> json) =>
      _$RecommendationFeedDtoFromJson(json);
}

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class RecommendationPaginationDto {
  const RecommendationPaginationDto({
    required this.page,
    required this.pageSize,
    required this.totalItems,
    required this.totalPages,
    required this.hasNext,
  });

  final int page;
  final int pageSize;
  final int totalItems;
  final int totalPages;
  final bool hasNext;

  factory RecommendationPaginationDto.fromJson(Map<String, dynamic> json) =>
      _$RecommendationPaginationDtoFromJson(json);
}

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class RecommendationCtaDto {
  const RecommendationCtaDto({
    required this.messageKey,
    required this.action,
  });

  final String messageKey;
  final String action;

  factory RecommendationCtaDto.fromJson(Map<String, dynamic> json) =>
      _$RecommendationCtaDtoFromJson(json);
}
