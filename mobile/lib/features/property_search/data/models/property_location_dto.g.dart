// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'property_location_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PropertyLocationDto _$PropertyLocationDtoFromJson(Map<String, dynamic> json) =>
    PropertyLocationDto(
      governorate: json['governorate'] as String,
      city: json['city'] as String,
      district: json['district'] as String,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
