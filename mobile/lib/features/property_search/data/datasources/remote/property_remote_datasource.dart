import 'package:injectable/injectable.dart';
import 'package:property_assistant/features/property_search/data/datasources/remote/property_api_service.dart';
import 'package:property_assistant/features/property_search/data/mappers/property_mapper.dart';
import 'package:property_assistant/features/property_search/data/mappers/property_search_query_mapper.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_detail.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_search_filters.dart';

@lazySingleton
class PropertyRemoteDataSource {
  PropertyRemoteDataSource(this._api);

  final PropertyApiService _api;

  Future<PropertySearchPage> search(PropertySearchFilters filters) async {
    final response = await _api.search(
      PropertySearchQueryMapper.toQueryParams(filters),
    );
    return PropertyMapper.toSearchPage(response);
  }

  Future<PropertyDetail> getDetail(String id) async {
    final dto = await _api.getDetail(id);
    return PropertyMapper.toDetail(dto);
  }
}
