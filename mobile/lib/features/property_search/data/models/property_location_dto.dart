double? _readDouble(dynamic value) {
  if (value == null) {
    return null;
  }
  if (value is num) {
    return value.toDouble();
  }
  if (value is String) {
    return double.tryParse(value);
  }
  return null;
}

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

  factory PropertyLocationDto.fromJson(Map<String, dynamic> json) {
    return PropertyLocationDto(
      governorate: json['governorate'] as String? ?? '',
      city: json['city'] as String? ?? '',
      district: json['district'] as String? ?? '',
      latitude: _readDouble(json['latitude']),
      longitude: _readDouble(json['longitude']),
    );
  }
}
