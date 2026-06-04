import 'package:json_annotation/json_annotation.dart';
import 'package:property_assistant/features/property_search/data/models/property_location_dto.dart';

part 'property_detail_dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class PropertyDetailDto {
  const PropertyDetailDto({
    required this.id,
    required this.title,
    this.description,
    required this.priceEgp,
    required this.listingType,
    required this.propertyType,
    this.bedrooms,
    this.bathrooms,
    this.areaSqm,
    required this.location,
    this.amenities = const [],
    this.images = const [],
    required this.provider,
    required this.providerLabel,
    this.sourceUrl,
    required this.syncedAt,
    this.isActive = true,
  });

  final String id;
  final String title;
  final String? description;
  final num priceEgp;
  final String listingType;
  final String propertyType;
  final int? bedrooms;
  final int? bathrooms;
  final num? areaSqm;
  final PropertyLocationDto location;
  final List<String> amenities;
  final List<String> images;
  final String provider;
  final String providerLabel;
  final String? sourceUrl;
  final String syncedAt;
  final bool isActive;

  factory PropertyDetailDto.fromJson(Map<String, dynamic> json) =>
      _$PropertyDetailDtoFromJson(json);
}
