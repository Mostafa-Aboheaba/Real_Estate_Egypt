import 'package:property_assistant/features/property_search/domain/entities/filter_option.dart';

/// Filter vocabulary for property search (aligned with platform API enums).
class PropertyFilterOptions {
  const PropertyFilterOptions({
    required this.listingTypes,
    required this.propertyTypes,
    required this.sortOptions,
    required this.bedroomOptions,
    this.cities = const [],
    this.pricePresets = const [],
  });

  final List<FilterOption> listingTypes;
  final List<FilterOption> propertyTypes;
  final List<FilterOption> sortOptions;
  final List<FilterOption> bedroomOptions;
  final List<FilterOption> cities;
  final List<FilterOption> pricePresets;
}
