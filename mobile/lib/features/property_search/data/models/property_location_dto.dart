import 'package:json_annotation/json_annotation.dart';

part 'property_location_dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.none, createToJson: false)
class PropertyLocationDto {
  const PropertyLocationDto({
    required this.governorate,
    required this.city,
    required this.district,
    this.latitude,
    this.longitude,
  });

  final String governorate;
  final String city;
  final String district;
  final double? latitude;
  final double? longitude;

  factory PropertyLocationDto.fromJson(Map<String, dynamic> json) =>
      _$PropertyLocationDtoFromJson(json);
}
