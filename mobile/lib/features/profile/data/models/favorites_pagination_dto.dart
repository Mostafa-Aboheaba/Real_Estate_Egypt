import 'package:json_annotation/json_annotation.dart';

part 'favorites_pagination_dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class FavoritesPaginationDto {
  const FavoritesPaginationDto({
    required this.page,
    required this.limit,
    required this.total,
    required this.hasMore,
  });

  final int page;
  final int limit;
  final int total;
  final bool hasMore;

  factory FavoritesPaginationDto.fromJson(Map<String, dynamic> json) =>
      _$FavoritesPaginationDtoFromJson(json);
}
