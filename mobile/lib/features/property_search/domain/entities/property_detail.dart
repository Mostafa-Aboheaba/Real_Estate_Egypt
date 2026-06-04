import 'package:property_assistant/features/property_search/domain/entities/property_list_item.dart';

/// Full listing detail from GET /properties/:id.
class PropertyDetail {
  const PropertyDetail({
    required this.id,
    required this.title,
    required this.description,
    required this.priceEgp,
    required this.listingType,
    required this.propertyType,
    required this.bedrooms,
    required this.bathrooms,
    required this.areaSqm,
    required this.location,
    required this.amenities,
    required this.images,
    required this.provider,
    required this.providerLabel,
    required this.sourceUrl,
    required this.syncedAt,
    required this.isActive,
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
  final PropertyLocation location;
  final List<String> amenities;
  final List<String> images;
  final String provider;
  final String providerLabel;
  final String? sourceUrl;
  final String syncedAt;
  final bool isActive;
}
