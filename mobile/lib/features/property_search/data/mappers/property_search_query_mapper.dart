import 'package:property_assistant/features/property_search/domain/entities/property_search_filters.dart';

/// Maps domain search filters to platform API query parameters.
abstract final class PropertySearchQueryMapper {
  static Map<String, dynamic> toQueryParams(PropertySearchFilters filters) {
    final params = <String, dynamic>{
      'page': filters.page,
      'pageSize': filters.pageSize,
      'sort': filters.sort,
    };
    if (filters.q != null && filters.q!.isNotEmpty) {
      params['q'] = filters.q;
    }
    if (filters.city != null && filters.city!.isNotEmpty) {
      params['city'] = filters.city;
    }
    if (filters.listingType != null) {
      params['listingType'] = filters.listingType;
    }
    if (filters.propertyType != null) {
      params['propertyType'] = filters.propertyType;
    }
    if (filters.minPrice != null) {
      params['minPrice'] = filters.minPrice;
    }
    if (filters.maxPrice != null) {
      params['maxPrice'] = filters.maxPrice;
    }
    if (filters.minBedrooms != null) {
      params['minBedrooms'] = filters.minBedrooms;
    }
    return params;
  }
}
