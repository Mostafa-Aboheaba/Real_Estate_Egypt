// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'favorites_page_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FavoritesPageDto _$FavoritesPageDtoFromJson(Map<String, dynamic> json) =>
    FavoritesPageDto(
      items: (json['items'] as List<dynamic>)
          .map((e) => FavoriteItemDto.fromJson(e as Map<String, dynamic>))
          .toList(),
      pagination: FavoritesPaginationDto.fromJson(
        json['pagination'] as Map<String, dynamic>,
      ),
    );
