// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'favorite_item_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FavoriteItemDto _$FavoriteItemDtoFromJson(Map<String, dynamic> json) =>
    FavoriteItemDto(
      id: json['id'] as String,
      propertyId: json['propertyId'] as String,
      createdAt: json['createdAt'] as String,
      property: PropertyListItemDto.fromJson(
        json['property'] as Map<String, dynamic>,
      ),
    );
