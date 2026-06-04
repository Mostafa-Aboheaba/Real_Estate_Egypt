import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/di/injection.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_detail.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_list_item.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_search_filters.dart';
import 'package:property_assistant/features/property_search/domain/repositories/property_repository.dart';

final propertyRepositoryProvider = Provider<PropertyRepository>(
  (ref) => getIt<PropertyRepository>(),
);

class PropertySearchState {
  const PropertySearchState({
    this.items = const [],
    this.filters = const PropertySearchFilters(),
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.total = 0,
    this.totalPages = 0,
    this.hasMore = false,
  });

  final List<PropertyListItem> items;
  final PropertySearchFilters filters;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final int total;
  final int totalPages;
  final bool hasMore;

  PropertySearchState copyWith({
    List<PropertyListItem>? items,
    PropertySearchFilters? filters,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    int? total,
    int? totalPages,
    bool? hasMore,
    bool clearError = false,
  }) {
    return PropertySearchState(
      items: items ?? this.items,
      filters: filters ?? this.filters,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: clearError ? null : (error ?? this.error),
      total: total ?? this.total,
      totalPages: totalPages ?? this.totalPages,
      hasMore: hasMore ?? this.hasMore,
    );
  }
}

final propertySearchProvider =
    NotifierProvider<PropertySearchNotifier, PropertySearchState>(
  PropertySearchNotifier.new,
);

class PropertySearchNotifier extends Notifier<PropertySearchState> {
  @override
  PropertySearchState build() {
    Future.microtask(() => search(refresh: true));
    return const PropertySearchState(isLoading: true);
  }

  PropertyRepository get _repo => ref.read(propertyRepositoryProvider);

  Future<void> search({required bool refresh}) async {
    final filters = refresh
        ? state.filters.copyWith(page: 1)
        : state.filters;

    state = state.copyWith(
      filters: filters,
      isLoading: refresh,
      isLoadingMore: !refresh,
      clearError: true,
    );

    try {
      final page = await _repo.search(filters);
      state = state.copyWith(
        items: refresh ? page.items : [...state.items, ...page.items],
        isLoading: false,
        isLoadingMore: false,
        total: page.total,
        totalPages: page.totalPages,
        hasMore: page.page < page.totalPages,
        filters: filters,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isLoadingMore: false,
        error: e.toString(),
      );
    }
  }

  void updateFilters(PropertySearchFilters filters) {
    state = state.copyWith(filters: filters);
    search(refresh: true);
  }

  Future<void> loadMore() async {
    if (state.isLoadingMore || !state.hasMore) return;
    state = state.copyWith(
      filters: state.filters.copyWith(page: state.filters.page + 1),
    );
    await search(refresh: false);
  }
}

final propertyDetailProvider = FutureProvider.family<PropertyDetail, String>(
  (ref, id) => ref.read(propertyRepositoryProvider).getDetail(id),
);
