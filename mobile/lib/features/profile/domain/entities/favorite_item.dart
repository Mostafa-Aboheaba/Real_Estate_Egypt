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
}
