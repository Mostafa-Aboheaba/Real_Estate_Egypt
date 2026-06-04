import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/core/error/failures.dart';
import 'package:property_assistant/core/widgets/error_view.dart';
import 'package:property_assistant/core/widgets/loading_indicator.dart';
import 'package:property_assistant/features/authentication/presentation/providers/auth_provider.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_search_filters.dart';
import 'package:property_assistant/features/property_search/presentation/providers/property_search_provider.dart';
import 'package:property_assistant/features/property_search/presentation/widgets/filters_bottom_sheet.dart';
import 'package:property_assistant/features/property_search/presentation/widgets/property_card.dart';
import 'package:property_assistant/l10n/app_localizations.dart';

class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});

  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  final _queryController = TextEditingController();

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(propertySearchProvider);
    final notifier = ref.read(propertySearchProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.searchTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune),
            onPressed: () => _openFilters(context, state.filters, notifier),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _queryController,
              decoration: InputDecoration(
                hintText: l10n.searchHint,
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _queryController.clear();
                    notifier.updateFilters(
                      state.filters.copyWith(q: ''),
                    );
                  },
                ),
                border: const OutlineInputBorder(),
              ),
              onSubmitted: (q) => notifier.updateFilters(
                state.filters.copyWith(q: q),
              ),
            ),
          ),
          if (state.total > 0)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(l10n.searchResultsCount(state.total)),
              ),
            ),
          Expanded(child: _buildBody(context, state, notifier)),
        ],
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    PropertySearchState state,
    PropertySearchNotifier notifier,
  ) {
    if (state.isLoading && state.items.isEmpty) {
      return const LoadingIndicator();
    }
    if (state.error != null && state.items.isEmpty) {
      return ErrorView(
        failure: Failure.unknown(message: state.error),
        onRetry: () => notifier.search(refresh: true),
      );
    }
    if (state.items.isEmpty) {
      return const Center(child: Text('No properties found'));
    }

    return NotificationListener<ScrollNotification>(
      onNotification: (n) {
        if (n is ScrollEndNotification &&
            n.metrics.pixels >= n.metrics.maxScrollExtent - 200) {
          _tryLoadMore(context, state, notifier);
        }
        return false;
      },
      child: RefreshIndicator(
        onRefresh: () => notifier.search(refresh: true),
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: state.items.length + (state.isLoadingMore ? 1 : 0),
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            if (index >= state.items.length) {
              return const Padding(
                padding: EdgeInsets.all(16),
                child: Center(child: CircularProgressIndicator()),
              );
            }
            final item = state.items[index];
            return PropertyCard(
              item: item,
              onTap: () => context.push(
                RoutePaths.propertyDetail(item.id),
              ),
            );
          },
        ),
      ),
    );
  }

  void _tryLoadMore(
    BuildContext context,
    PropertySearchState state,
    PropertySearchNotifier notifier,
  ) {
    if (!state.hasMore) return;
    final session = ref.read(authSessionProvider).valueOrNull;
    final nextPage = state.filters.page + 1;
    if (nextPage > 1 && session == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sign in to view more results')),
      );
      context.push(RoutePaths.login);
      return;
    }
    notifier.loadMore();
  }

  void _openFilters(
    BuildContext context,
    PropertySearchFilters filters,
    PropertySearchNotifier notifier,
  ) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => FiltersBottomSheet(
        initial: filters,
        onApply: notifier.updateFilters,
      ),
    );
  }
}
