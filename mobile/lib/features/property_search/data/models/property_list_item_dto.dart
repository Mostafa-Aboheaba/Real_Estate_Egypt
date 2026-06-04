import 'package:json_annotation/json_annotation.dart';
import 'package:property_assistant/features/property_search/data/models/property_location_dto.dart';

part 'property_list_item_dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class PropertyListItemDto {
  const PropertyListItemDto({
    required this.id,
    required this.title,
    required this.priceEgp,
    required this.listingType,
    required this.propertyType,
    this.bedrooms,
    this.bathrooms,
    this.areaSqm,
    required this.location,
    this.thumbnailUrl,
    required this.provider,
    required this.providerLabel,
    required this.syncedAt,
  });

  final String id;
  final String title;
  final num priceEgp;
  final String listingType;
  final String propertyType;
  final int? bedrooms;
  final int? bathrooms;
  final num? areaSqm;
  final PropertyLocationDto location;
  final String? thumbnailUrl;
  final String provider;
  final String providerLabel;
  final String syncedAt;

  factory PropertyListItemDto.fromJson(Map<String, dynamic> json) =>
      _$PropertyListItemDtoFromJson(json);
}
