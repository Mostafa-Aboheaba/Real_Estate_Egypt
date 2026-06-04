// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'property_search_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PropertySearchResponseDto _$PropertySearchResponseDtoFromJson(
  Map<String, dynamic> json,
) => PropertySearchResponseDto(
  data: (json['data'] as List<dynamic>)
      .map((e) => PropertyListItemDto.fromJson(e as Map<String, dynamic>))
      .toList(),
  meta: PropertySearchMetaDto.fromJson(json['meta'] as Map<String, dynamic>),
);
