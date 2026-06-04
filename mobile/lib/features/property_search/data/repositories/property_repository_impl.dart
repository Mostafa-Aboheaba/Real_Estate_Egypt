import 'package:injectable/injectable.dart';
import 'package:property_assistant/features/property_search/data/datasources/remote/property_remote_datasource.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_detail.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_search_filters.dart';
import 'package:property_assistant/features/property_search/domain/repositories/property_repository.dart';

@LazySingleton(as: PropertyRepository)
class PropertyRepositoryImpl implements PropertyRepository {
  PropertyRepositoryImpl(this._remote);

  final PropertyRemoteDataSource _remote;

  @override
  Future<PropertySearchPage> search(PropertySearchFilters filters) {
    return _remote.search(filters);
  }

  @override
  Future<PropertyDetail> getDetail(String id) {
    return _remote.getDetail(id);
  }
}
