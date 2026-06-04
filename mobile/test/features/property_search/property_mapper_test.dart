import 'package:flutter_test/flutter_test.dart';
import 'package:property_assistant/features/property_search/data/mappers/property_mapper.dart';
import 'package:property_assistant/features/property_search/data/models/property_list_item_dto.dart';
import 'package:property_assistant/features/property_search/data/models/property_location_dto.dart';
import 'package:property_assistant/features/property_search/data/models/property_search_meta_dto.dart';
import 'package:property_assistant/features/property_search/data/models/property_search_response_dto.dart';

void main() {
  test('PropertyMapper maps search response DTO to domain page', () {
    const dto = PropertySearchResponseDto(
      data: [
        PropertyListItemDto(
          id: 'p1',
          title: 'Villa',
          priceEgp: 1_500_000,
          listingType: 'sale',
          propertyType: 'villa',
          bedrooms: 3,
          bathrooms: 2,
          areaSqm: 200,
          location: PropertyLocationDto(
            governorate: 'Alexandria',
            city: 'Alexandria',
            district: 'Smouha',
          ),
          thumbnailUrl: 'https://cdn.example/thumb.jpg',
          provider: 'shaety',
          providerLabel: 'Shaety',
          syncedAt: '2026-06-01T00:00:00.000Z',
        ),
      ],
      meta: PropertySearchMetaDto(
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
      ),
    );

    final page = PropertyMapper.toSearchPage(dto);

    expect(page.items, hasLength(1));
    expect(page.items.first.id, 'p1');
    expect(page.items.first.location.shortLabel, 'Smouha, Alexandria');
    expect(page.total, 1);
  });
}
