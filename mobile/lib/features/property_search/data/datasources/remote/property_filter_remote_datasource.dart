import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';
import 'package:property_assistant/features/property_search/domain/entities/filter_option.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_filter_options.dart';

@lazySingleton
class PropertyFilterRemoteDataSource {
  PropertyFilterRemoteDataSource(this._dio);

  final Dio _dio;

  Future<PropertyFilterOptions> fetchOptions() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/properties/filters/options',
    );
    final json = response.data ?? {};

    List<FilterOption> mapOptions(
      String key, {
      bool allowNull = false,
    }) {
      final raw = json[key];
      if (raw is! List) {
        return const [];
      }
      return raw
          .whereType<Map<String, dynamic>>()
          .map(
            (item) => FilterOption(
              value: allowNull && item['value'] == null
                  ? null
                  : item['value']?.toString(),
              label: item['label'] as String? ?? '',
            ),
          )
          .toList();
    }

    return PropertyFilterOptions(
      listingTypes: mapOptions('listingTypes', allowNull: true),
      propertyTypes: mapOptions('propertyTypes'),
      sortOptions: mapOptions('sortOptions'),
      bedroomOptions: mapOptions('bedroomOptions', allowNull: true),
      cities: mapOptions('cities'),
      pricePresets: mapOptions('pricePresets'),
    );
  }
}
