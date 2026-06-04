import 'package:json_annotation/json_annotation.dart';
import 'package:property_assistant/features/property_search/data/models/property_list_item_dto.dart';

part 'favorite_item_dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class FavoriteItemDto {
  const FavoriteItemDto({
    required this.id,
    required this.propertyId,
    required this.createdAt,
    required this.property,
  });

  final String id;
  final String propertyId;
  final String createdAt;
  final PropertyListItemDto property;

  factory FavoriteItemDto.fromJson(Map<String, dynamic> json) =>
      _$FavoriteItemDtoFromJson(json);
}
