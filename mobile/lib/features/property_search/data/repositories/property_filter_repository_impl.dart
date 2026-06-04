import 'package:injectable/injectable.dart';
import 'package:property_assistant/features/property_search/data/datasources/local/property_filter_local_datasource.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_filter_options.dart';
import 'package:property_assistant/features/property_search/domain/repositories/property_filter_repository.dart';

@LazySingleton(as: PropertyFilterRepository)
class PropertyFilterRepositoryImpl implements PropertyFilterRepository {
  PropertyFilterRepositoryImpl(this._local);

  final PropertyFilterLocalDataSource _local;

  @override
  Future<PropertyFilterOptions> getOptions() => _local.loadOptions();
}
