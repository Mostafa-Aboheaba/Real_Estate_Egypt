import 'package:injectable/injectable.dart';
import 'package:property_assistant/features/property_search/domain/entities/filter_option.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_filter_options.dart';

/// Static filter vocabulary until a platform `/filters` metadata endpoint exists.
@lazySingleton
class PropertyFilterLocalDataSource {
  Future<PropertyFilterOptions> loadOptions() async {
    return const PropertyFilterOptions(
      listingTypes: [
        FilterOption(value: null, label: 'Any'),
        FilterOption(value: 'sale', label: 'Sale'),
        FilterOption(value: 'rent', label: 'Rent'),
      ],
      propertyTypes: [
        FilterOption(value: 'apartment', label: 'Apartment'),
        FilterOption(value: 'villa', label: 'Villa'),
        FilterOption(value: 'duplex', label: 'Duplex'),
        FilterOption(value: 'townhouse', label: 'Townhouse'),
        FilterOption(value: 'commercial', label: 'Commercial'),
        FilterOption(value: 'land', label: 'Land'),
        FilterOption(value: 'other', label: 'Other'),
      ],
      sortOptions: [
        FilterOption(value: 'newest', label: 'Newest'),
        FilterOption(value: 'price_asc', label: 'Price: Low to High'),
        FilterOption(value: 'price_desc', label: 'Price: High to Low'),
        FilterOption(value: 'relevance', label: 'Relevance'),
      ],
      bedroomOptions: [
        FilterOption(value: null, label: 'Any'),
        FilterOption(value: '1', label: '1+'),
        FilterOption(value: '2', label: '2+'),
        FilterOption(value: '3', label: '3+'),
        FilterOption(value: '4', label: '4+'),
        FilterOption(value: '5', label: '5+'),
      ],
    );
  }
}
