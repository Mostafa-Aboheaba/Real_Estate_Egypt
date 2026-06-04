import 'package:json_annotation/json_annotation.dart';

part 'property_search_meta_dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class PropertySearchMetaDto {
  const PropertySearchMetaDto({
    required this.page,
    required this.pageSize,
    required this.total,
    required this.totalPages,
  });

  final int page;
  final int pageSize;
  final int total;
  final int totalPages;

  factory PropertySearchMetaDto.fromJson(Map<String, dynamic> json) =>
      _$PropertySearchMetaDtoFromJson(json);
}
