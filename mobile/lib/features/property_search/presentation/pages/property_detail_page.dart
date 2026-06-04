import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/error/failures.dart';
import 'package:property_assistant/core/widgets/error_view.dart';
import 'package:property_assistant/core/widgets/loading_indicator.dart';
import 'package:property_assistant/features/authentication/presentation/providers/auth_provider.dart';
import 'package:property_assistant/features/profile/presentation/providers/profile_provider.dart';
import 'package:property_assistant/features/property_search/presentation/providers/property_search_provider.dart';
import 'package:property_assistant/l10n/app_localizations.dart';

class PropertyDetailPage extends ConsumerWidget {
  const PropertyDetailPage({required this.propertyId, super.key});

  final String propertyId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final asyncDetail = ref.watch(propertyDetailProvider(propertyId));
    final session = ref.watch(authSessionProvider);
    final isSignedIn = session.valueOrNull != null;
    if (isSignedIn) {
      ref.watch(favoritesProvider);
    }
    final isFavorite = isSignedIn
        ? ref.watch(isFavoriteProvider(propertyId))
        : false;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.propertyDetailTitle),
        actions: [
          if (isSignedIn)
            IconButton(
              icon: Icon(
                isFavorite ? Icons.favorite : Icons.favorite_border,
                color: isFavorite ? Colors.red : null,
              ),
              onPressed: () async {
                await toggleFavorite(ref, propertyId, isFavorite);
              },
            ),
        ],
      ),
      body: asyncDetail.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          failure: Failure.unknown(message: e.toString()),
          onRetry: () => ref.invalidate(propertyDetailProvider(propertyId)),
        ),
        data: (detail) => ListView(
          children: [
            if (detail.images.isNotEmpty)
              SizedBox(
                height: 240,
                child: PageView.builder(
                  itemCount: detail.images.length,
                  itemBuilder: (_, i) => Image.network(
                    detail.images[i],
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const ColoredBox(
                      color: Color(0xFFE0E0E0),
                      child: Icon(Icons.broken_image, size: 48),
                    ),
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    detail.title,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${detail.priceEgp} EGP',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: Theme.of(context).colorScheme.primary,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(detail.location.shortLabel),
                  const SizedBox(height: 16),
                  if (detail.description != null) ...[
                    Text(
                      l10n.propertyDescription,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(detail.description!),
                  ],
                  if (detail.amenities.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Text(
                      l10n.propertyAmenities,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: detail.amenities
                          .map((a) => Chip(label: Text(a)))
                          .toList(),
                    ),
                  ],
                  const SizedBox(height: 16),
                  Text(
                    detail.providerLabel,
                    style: Theme.of(context).textTheme.labelSmall,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
