// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'favorites_pagination_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FavoritesPaginationDto _$FavoritesPaginationDtoFromJson(
  Map<String, dynamic> json,
) => FavoritesPaginationDto(
  page: (json['page'] as num).toInt(),
  limit: (json['limit'] as num).toInt(),
  total: (json['total'] as num).toInt(),
  hasMore: json['hasMore'] as bool,
);
