import 'package:property_assistant/features/property_search/data/models/property_detail_dto.dart';
import 'package:property_assistant/features/property_search/data/models/property_list_item_dto.dart';
import 'package:property_assistant/features/property_search/data/models/property_location_dto.dart';
import 'package:property_assistant/features/property_search/data/models/property_search_response_dto.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_detail.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_list_item.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_search_filters.dart';

/// Maps property API DTOs to domain entities.
abstract final class PropertyMapper {
  static PropertyLocation toLocation(PropertyLocationDto dto) {
    return PropertyLocation(
      governorate: dto.governorate,
      city: dto.city,
      district: dto.district,
      latitude: dto.latitude,
      longitude: dto.longitude,
    );
  }

  static PropertyListItem toListItem(PropertyListItemDto dto) {
    return PropertyListItem(
      id: dto.id,
      title: dto.title,
      priceEgp: dto.priceEgp,
      listingType: dto.listingType,
      propertyType: dto.propertyType,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      areaSqm: dto.areaSqm,
      location: toLocation(dto.location),
      thumbnailUrl: dto.thumbnailUrl,
      provider: dto.provider,
      providerLabel: dto.providerLabel,
      syncedAt: dto.syncedAt,
    );
  }

  static PropertyDetail toDetail(PropertyDetailDto dto) {
    return PropertyDetail(
      id: dto.id,
      title: dto.title,
      description: dto.description,
      priceEgp: dto.priceEgp,
      listingType: dto.listingType,
      propertyType: dto.propertyType,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      areaSqm: dto.areaSqm,
      location: toLocation(dto.location),
      amenities: dto.amenities,
      images: dto.images,
      provider: dto.provider,
      providerLabel: dto.providerLabel,
      sourceUrl: dto.sourceUrl,
      syncedAt: dto.syncedAt,
      isActive: dto.isActive,
    );
  }

  static PropertySearchPage toSearchPage(PropertySearchResponseDto dto) {
    return PropertySearchPage(
      items: dto.data.map(toListItem).toList(),
      page: dto.meta.page,
      pageSize: dto.meta.pageSize,
      total: dto.meta.total,
      totalPages: dto.meta.totalPages,
    );
  }
}
