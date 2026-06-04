import 'package:property_assistant/features/property_search/domain/entities/property_detail.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_search_filters.dart';

abstract class PropertyRepository {
  Future<PropertySearchPage> search(PropertySearchFilters filters);

  Future<PropertyDetail> getDetail(String id);
}
