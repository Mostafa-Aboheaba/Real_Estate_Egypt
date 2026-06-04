import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/core/widgets/loading_indicator.dart';
import 'package:property_assistant/features/profile/presentation/providers/profile_provider.dart';
import 'package:property_assistant/features/property_search/presentation/widgets/property_card.dart';
import 'package:property_assistant/l10n/app_localizations.dart';

class FavoritesPage extends ConsumerWidget {
  const FavoritesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final favorites = ref.watch(favoritesProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.profileFavorites)),
      body: favorites.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => Center(child: Text('$e')),
        data: (page) {
          if (page == null || page.items.isEmpty) {
            return Center(child: Text(l10n.profileFavoritesEmpty));
          }
          return RefreshIndicator(
            onRefresh: () =>
                ref.read(favoritesProvider.notifier).refresh(),
            child: ListView.builder(
              itemCount: page.items.length,
              itemBuilder: (context, index) {
                final item = page.items[index];
                return PropertyCard(
                  item: item.property,
                  onTap: () => context.push(
                    RoutePaths.propertyDetail(item.propertyId),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
