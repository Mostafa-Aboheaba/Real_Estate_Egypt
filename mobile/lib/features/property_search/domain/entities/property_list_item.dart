/// Summary row for property search results.
class PropertyListItem {
  const PropertyListItem({
    required this.id,
    required this.title,
    required this.priceEgp,
    required this.listingType,
    required this.propertyType,
    required this.bedrooms,
    required this.bathrooms,
    required this.areaSqm,
    required this.location,
    required this.thumbnailUrl,
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
  final PropertyLocation location;
  final String? thumbnailUrl;
  final String provider;
  final String providerLabel;
  final String syncedAt;

  factory PropertyListItem.fromJson(Map<String, dynamic> json) {
    return PropertyListItem(
      id: json['id'] as String,
      title: json['title'] as String,
      priceEgp: json['priceEgp'] as num,
      listingType: json['listingType'] as String,
      propertyType: json['propertyType'] as String,
      bedrooms: json['bedrooms'] as int?,
      bathrooms: json['bathrooms'] as int?,
      areaSqm: json['areaSqm'] as num?,
      location: PropertyLocation.fromJson(
        json['location'] as Map<String, dynamic>,
      ),
      thumbnailUrl: json['thumbnailUrl'] as String?,
      provider: json['provider'] as String,
      providerLabel: json['providerLabel'] as String,
      syncedAt: json['syncedAt'] as String,
    );
  }
}

class PropertyLocation {
  const PropertyLocation({
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

  factory PropertyLocation.fromJson(Map<String, dynamic> json) {
    return PropertyLocation(
      governorate: json['governorate'] as String,
      city: json['city'] as String,
      district: json['district'] as String,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }

  String get shortLabel => '$district, $city';
}
