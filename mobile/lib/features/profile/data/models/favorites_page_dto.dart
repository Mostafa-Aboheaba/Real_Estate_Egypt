import 'package:json_annotation/json_annotation.dart';
import 'package:property_assistant/features/profile/data/models/favorite_item_dto.dart';
import 'package:property_assistant/features/profile/data/models/favorites_pagination_dto.dart';

part 'favorites_page_dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class FavoritesPageDto {
  const FavoritesPageDto({
    required this.items,
    required this.pagination,
  });

  final List<FavoriteItemDto> items;
  final FavoritesPaginationDto pagination;

  factory FavoritesPageDto.fromJson(Map<String, dynamic> json) =>
      _$FavoritesPageDtoFromJson(json);
}
