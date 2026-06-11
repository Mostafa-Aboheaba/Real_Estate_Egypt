// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recommendation_feed_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RecommendationFeedDto _$RecommendationFeedDtoFromJson(
  Map<String, dynamic> json,
) => RecommendationFeedDto(
  title: json['title'] as String,
  mode: json['mode'] as String,
  items: (json['items'] as List<dynamic>)
      .map((e) => RecommendationItemDto.fromJson(e as Map<String, dynamic>))
      .toList(),
  pagination: RecommendationPaginationDto.fromJson(
    json['pagination'] as Map<String, dynamic>,
  ),
  cta: json['cta'] == null
      ? null
      : RecommendationCtaDto.fromJson(json['cta'] as Map<String, dynamic>),
);

RecommendationPaginationDto _$RecommendationPaginationDtoFromJson(
  Map<String, dynamic> json,
) => RecommendationPaginationDto(
  page: (json['page'] as num).toInt(),
  pageSize: (json['pageSize'] as num).toInt(),
  totalItems: (json['totalItems'] as num).toInt(),
  totalPages: (json['totalPages'] as num).toInt(),
  hasNext: json['hasNext'] as bool,
);

RecommendationCtaDto _$RecommendationCtaDtoFromJson(
  Map<String, dynamic> json,
) => RecommendationCtaDto(
  messageKey: json['messageKey'] as String,
  action: json['action'] as String,
);
