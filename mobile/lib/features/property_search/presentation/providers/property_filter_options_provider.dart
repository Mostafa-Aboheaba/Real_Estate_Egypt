import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/di/injection.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_filter_options.dart';
import 'package:property_assistant/features/property_search/domain/repositories/property_filter_repository.dart';

final propertyFilterRepositoryProvider = Provider<PropertyFilterRepository>(
  (ref) => getIt<PropertyFilterRepository>(),
);

final propertyFilterOptionsProvider =
    FutureProvider<PropertyFilterOptions>((ref) async {
  return ref.read(propertyFilterRepositoryProvider).getOptions();
});
