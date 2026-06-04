import 'package:json_annotation/json_annotation.dart';
import 'package:property_assistant/features/property_search/data/models/property_list_item_dto.dart';
import 'package:property_assistant/features/property_search/data/models/property_search_meta_dto.dart';

part 'property_search_response_dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class PropertySearchResponseDto {
  const PropertySearchResponseDto({
    required this.data,
    required this.meta,
  });

  final List<PropertyListItemDto> data;
  final PropertySearchMetaDto meta;

  factory PropertySearchResponseDto.fromJson(Map<String, dynamic> json) =>
      _$PropertySearchResponseDtoFromJson(json);
}
