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

  String get shortLabel => '$district, $city';
}
