import 'package:property_assistant/features/property_search/domain/entities/property_filter_options.dart';

abstract class PropertyFilterRepository {
  Future<PropertyFilterOptions> getOptions();
}
