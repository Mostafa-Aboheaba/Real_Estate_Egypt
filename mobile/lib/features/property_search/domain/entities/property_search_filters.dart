import 'package:property_assistant/features/property_search/domain/entities/property_list_item.dart';

/// Query filters for property search.
class PropertySearchFilters {
  const PropertySearchFilters({
    this.q,
    this.city,
    this.listingType,
    this.propertyType,
    this.minPrice,
    this.maxPrice,
    this.minBedrooms,
    this.sort = 'newest',
    this.page = 1,
    this.pageSize = 20,
  });

  final String? q;
  final String? city;
  final String? listingType;
  final String? propertyType;
  final int? minPrice;
  final int? maxPrice;
  final int? minBedrooms;
  final String sort;
  final int page;
  final int pageSize;

  PropertySearchFilters copyWith({
    String? q,
    String? city,
    String? listingType,
    String? propertyType,
    int? minPrice,
    int? maxPrice,
    int? minBedrooms,
    String? sort,
    int? page,
    int? pageSize,
  }) {
    return PropertySearchFilters(
      q: q ?? this.q,
      city: city ?? this.city,
      listingType: listingType ?? this.listingType,
      propertyType: propertyType ?? this.propertyType,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      minBedrooms: minBedrooms ?? this.minBedrooms,
      sort: sort ?? this.sort,
      page: page ?? this.page,
      pageSize: pageSize ?? this.pageSize,
    );
  }

}

class PropertySearchPage {
  const PropertySearchPage({
    required this.items,
    required this.page,
    required this.pageSize,
    required this.total,
    required this.totalPages,
  });

  final List<PropertyListItem> items;
  final int page;
  final int pageSize;
  final int total;
  final int totalPages;
}
