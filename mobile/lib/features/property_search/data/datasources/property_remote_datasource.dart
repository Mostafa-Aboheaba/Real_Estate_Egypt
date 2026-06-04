import 'package:injectable/injectable.dart';
import 'package:property_assistant/core/constants/api_constants.dart';
import 'package:property_assistant/core/network/api_client.dart';
import 'package:property_assistant/core/network/api_response.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_detail.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_list_item.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_search_filters.dart';

@lazySingleton
class PropertyRemoteDataSource {
  PropertyRemoteDataSource(this._client);

  final ApiClient _client;

  Future<PropertySearchPage> search(PropertySearchFilters filters) async {
    final response = await _client.get<Map<String, dynamic>>(
      ApiConstants.properties,
      queryParameters: filters.toQueryParams(),
    );
    final body = response.data;
    if (body == null) {
      throw const FormatException('Empty search response');
    }

    final itemsRaw = body['data'] as List<dynamic>? ?? [];
    final meta = body['meta'] as Map<String, dynamic>? ?? {};

    final items = itemsRaw
        .map((e) => PropertyListItem.fromJson(e as Map<String, dynamic>))
        .toList();

    return PropertySearchPage(
      items: items,
      page: meta['page'] as int? ?? 1,
      pageSize: meta['pageSize'] as int? ?? 20,
      total: meta['total'] as int? ?? items.length,
      totalPages: meta['totalPages'] as int? ?? 1,
    );
  }

  Future<PropertyDetail> getDetail(String id) async {
    final response = await _client.get<Map<String, dynamic>>(
      '${ApiConstants.properties}/$id',
    );
    final data = unwrapApiData(response.data);
    if (data == null) {
      throw const FormatException('Invalid property detail response');
    }
    return PropertyDetail.fromJson(data);
  }
}
