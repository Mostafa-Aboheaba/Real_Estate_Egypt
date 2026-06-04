import 'package:property_assistant/features/property_search/domain/entities/property_list_item.dart';

class FavoriteItem {
  const FavoriteItem({
    required this.id,
    required this.propertyId,
    required this.createdAt,
    required this.property,
  });

  final String id;
  final String propertyId;
  final String createdAt;
  final PropertyListItem property;

  factory FavoriteItem.fromJson(Map<String, dynamic> json) {
    final prop = json['property'] as Map<String, dynamic>;
    return FavoriteItem(
      id: json['id'] as String,
      propertyId: json['propertyId'] as String,
      createdAt: json['createdAt'] as String,
      property: PropertyListItem.fromJson({
        'id': prop['id'],
        'title': prop['title'],
        'priceEgp': prop['priceEgp'],
        'listingType': prop['listingType'],
        'propertyType': prop['propertyType'] ?? 'apartment',
        'bedrooms': prop['bedrooms'],
        'bathrooms': prop['bathrooms'],
        'areaSqm': prop['areaSqm'],
        'location': {
          'governorate': (prop['location'] as Map?)?['governorate'] ?? '',
          'city': (prop['location'] as Map?)?['city'] ?? '',
          'district': (prop['location'] as Map?)?['district'] ?? '',
        },
        'thumbnailUrl': prop['thumbnailUrl'],
        'provider': prop['provider'] ?? 'shaety',
        'providerLabel': prop['provider'] ?? 'shaety',
        'syncedAt': prop['syncedAt'] ?? DateTime.now().toIso8601String(),
      }),
    );
  }
}

class FavoritesPage {
  const FavoritesPage({
    required this.items,
    required this.page,
    required this.limit,
    required this.total,
    required this.hasMore,
  });

  final List<FavoriteItem> items;
  final int page;
  final int limit;
  final int total;
  final bool hasMore;

  factory FavoritesPage.fromJson(Map<String, dynamic> json) {
    final itemsRaw = json['items'] as List<dynamic>? ?? [];
    final pagination = json['pagination'] as Map<String, dynamic>? ?? {};
    return FavoritesPage(
      items: itemsRaw
          .map((e) => FavoriteItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      page: pagination['page'] as int? ?? 1,
      limit: pagination['limit'] as int? ?? 20,
      total: pagination['total'] as int? ?? 0,
      hasMore: pagination['hasMore'] as bool? ?? false,
    );
  }
}
